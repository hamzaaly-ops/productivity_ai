from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import IdleEpisode, WorkLog
from app.schemas import IdleEpisodeCreate, WorkLogCreate
from app.utils import clamp, minutes_between, overlap_minutes
from ml.anomaly_detector import detect_anomaly
from ml.burnout_detector import detect_burnout
from ml.feature_engineering import build_feature_vector
from ml.productivity_score import calculate_productivity_score


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def _day_bounds(target_date: date) -> tuple[datetime, datetime]:
    day_start = datetime.combine(target_date, time.min)
    day_end = day_start + timedelta(days=1)
    return day_start, day_end


def create_idle_episode(db: Session, user_id: str, payload: IdleEpisodeCreate) -> IdleEpisode:
    idle_started_at = _normalize_datetime(payload.idle_started_at)
    idle_ended_at = _normalize_datetime(payload.idle_ended_at)

    if idle_ended_at <= idle_started_at:
        raise HTTPException(status_code=400, detail="idle_ended_at must be after idle_started_at.")

    idle_minutes = minutes_between(idle_started_at, idle_ended_at)
    if idle_minutes < settings.idle_threshold_minutes:
        raise HTTPException(
            status_code=422,
            detail=f"Idle episode must be at least {settings.idle_threshold_minutes} minutes.",
        )

    episode = IdleEpisode(
        user_id=user_id,
        idle_started_at=idle_started_at,
        idle_ended_at=idle_ended_at,
        idle_minutes=round(idle_minutes, 2),
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return episode


def create_work_log(db: Session, user_id: str, payload: WorkLogCreate) -> WorkLog:
    session_started_at = _normalize_datetime(payload.session_started_at)
    session_ended_at = _normalize_datetime(payload.session_ended_at)

    if session_ended_at <= session_started_at:
        raise HTTPException(status_code=400, detail="session_ended_at must be after session_started_at.")

    inferred_tracked = minutes_between(session_started_at, session_ended_at)
    tracked_minutes = inferred_tracked if payload.tracked_minutes is None else payload.tracked_minutes
    if tracked_minutes <= 0:
        raise HTTPException(status_code=422, detail="tracked_minutes must be greater than 0.")

    work_log = WorkLog(
        user_id=user_id,
        session_started_at=session_started_at,
        session_ended_at=session_ended_at,
        tracked_minutes=round(tracked_minutes, 2),
        active_minutes=round(clamp(payload.active_minutes, 0.0, tracked_minutes), 2),
        deep_work_minutes=round(clamp(payload.deep_work_minutes, 0.0, tracked_minutes), 2),
        engagement_score=payload.engagement_score,
        context_switch_count=payload.context_switch_count,
        assigned_tasks=payload.assigned_tasks,
        completed_tasks=payload.completed_tasks,
        break_minutes=round(clamp(payload.break_minutes, 0.0, tracked_minutes), 2),
        late_night_minutes=round(max(payload.late_night_minutes, 0.0), 2),
        weekend_minutes=round(max(payload.weekend_minutes, 0.0), 2),
    )
    db.add(work_log)
    db.commit()
    db.refresh(work_log)
    return work_log


def _aggregate_idle_metrics(db: Session, user_id: str, day_start: datetime, day_end: datetime) -> dict[str, float]:
    query = select(IdleEpisode).where(
        IdleEpisode.user_id == user_id,
        IdleEpisode.idle_started_at < day_end,
        IdleEpisode.idle_ended_at > day_start,
    )
    episodes = db.scalars(query).all()

    overlaps: list[float] = []
    for episode in episodes:
        overlap = overlap_minutes(
            episode.idle_started_at, episode.idle_ended_at, day_start, day_end
        )
        if overlap > 0:
            overlaps.append(overlap)

    total_isolation_minutes = sum(overlaps)
    isolation_count = len(overlaps)
    avg_isolation_duration = total_isolation_minutes / isolation_count if isolation_count else 0.0
    longest_isolation = max(overlaps) if overlaps else 0.0

    return {
        "isolation_count": isolation_count,
        "total_isolation_minutes": round(total_isolation_minutes, 2),
        "avg_isolation_duration_minutes": round(avg_isolation_duration, 2),
        "longest_isolation_minutes": round(longest_isolation, 2),
    }


def _aggregate_work_metrics(db: Session, user_id: str, day_start: datetime, day_end: datetime) -> dict[str, float]:
    query = select(WorkLog).where(
        WorkLog.user_id == user_id,
        WorkLog.session_started_at < day_end,
        WorkLog.session_ended_at > day_start,
    )
    logs = db.scalars(query).all()

    tracked_minutes = 0.0
    active_minutes = 0.0
    deep_work_minutes = 0.0
    context_switch_count = 0.0
    assigned_tasks = 0.0
    completed_tasks = 0.0
    break_minutes = 0.0
    late_night_minutes = 0.0
    weekend_minutes = 0.0
    engagement_weighted_sum = 0.0
    engagement_weight = 0.0

    for log in logs:
        overlap = overlap_minutes(
            log.session_started_at, log.session_ended_at, day_start, day_end
        )
        if overlap <= 0:
            continue

        window_minutes = minutes_between(log.session_started_at, log.session_ended_at)
        if window_minutes <= 0:
            continue
        ratio = overlap / window_minutes

        tracked_minutes += overlap
        active_minutes += log.active_minutes * ratio
        deep_work_minutes += log.deep_work_minutes * ratio
        context_switch_count += log.context_switch_count * ratio
        assigned_tasks += log.assigned_tasks * ratio
        completed_tasks += log.completed_tasks * ratio
        break_minutes += log.break_minutes * ratio
        late_night_minutes += log.late_night_minutes * ratio
        weekend_minutes += log.weekend_minutes * ratio

        if log.engagement_score is not None:
            engagement_weighted_sum += log.engagement_score * overlap
            engagement_weight += overlap

    engagement_score = None
    if engagement_weight > 0:
        engagement_score = engagement_weighted_sum / engagement_weight

    return {
        "tracked_minutes": round(tracked_minutes, 2),
        "active_minutes": round(active_minutes, 2),
        "deep_work_minutes": round(deep_work_minutes, 2),
        "context_switch_count": round(context_switch_count, 2),
        "assigned_tasks": round(assigned_tasks, 2),
        "completed_tasks": round(completed_tasks, 2),
        "break_minutes": round(break_minutes, 2),
        "late_night_minutes": round(late_night_minutes, 2),
        "weekend_minutes": round(weekend_minutes, 2),
        "engagement_score": None if engagement_score is None else round(engagement_score, 4),
    }


def get_daily_summary(db: Session, user_id: str, target_date: date) -> dict[str, object]:
    day_start, day_end = _day_bounds(target_date)
    idle_metrics = _aggregate_idle_metrics(db, user_id, day_start, day_end)
    work_metrics = _aggregate_work_metrics(db, user_id, day_start, day_end)

    aggregates = {**idle_metrics, **work_metrics}
    features = build_feature_vector(aggregates)
    productivity_score, score_breakdown = calculate_productivity_score(features)

    return {
        "user_id": user_id,
        "date": target_date,
        "isolation_count": idle_metrics["isolation_count"],
        "total_isolation_minutes": idle_metrics["total_isolation_minutes"],
        "avg_isolation_duration_minutes": idle_metrics["avg_isolation_duration_minutes"],
        "longest_isolation_minutes": idle_metrics["longest_isolation_minutes"],
        "isolation_rate": features["isolation_rate"],
        "tracked_minutes": features["tracked_minutes"],
        "active_minutes": features["active_minutes"],
        "deep_work_minutes": features["deep_work_minutes"],
        "deep_work_norm": features["deep_work_norm"],
        "engagement_norm": features["engagement_norm"],
        "task_completion_norm": features["task_completion_norm"],
        "switch_norm": features["switch_norm"],
        "productivity_score": productivity_score,
        "breakdown": score_breakdown,
        "break_minutes": work_metrics["break_minutes"],
        "late_night_minutes": work_metrics["late_night_minutes"],
        "weekend_minutes": work_metrics["weekend_minutes"],
    }


def _date_range(end_date: date, lookback_days: int) -> list[date]:
    start_date = end_date - timedelta(days=lookback_days - 1)
    return [start_date + timedelta(days=i) for i in range(lookback_days)]


def get_burnout_report(db: Session, user_id: str, end_date: date, lookback_days: int) -> dict[str, object]:
    if lookback_days < 2:
        raise HTTPException(status_code=422, detail="lookback_days must be at least 2.")

    history = [get_daily_summary(db, user_id, day) for day in _date_range(end_date, lookback_days)]
    return detect_burnout(history, lookback_days)


def get_anomaly_report(db: Session, user_id: str, target_date: date, lookback_days: int) -> dict[str, object]:
    if lookback_days < 3:
        raise HTTPException(status_code=422, detail="lookback_days must be at least 3.")

    history = [get_daily_summary(db, user_id, day) for day in _date_range(target_date, lookback_days)]

    feature_history: list[dict[str, float]] = []
    for day in history:
        feature_history.append(
            {
                "deep_work_norm": float(day["deep_work_norm"]),
                "engagement_norm": float(day["engagement_norm"]),
                "task_completion_norm": float(day["task_completion_norm"]),
                "switch_norm": float(day["switch_norm"]),
                "isolation_rate": float(day["isolation_rate"]),
                "productivity_score": float(day["productivity_score"]),
            }
        )

    return detect_anomaly(feature_history, lookback_days)
