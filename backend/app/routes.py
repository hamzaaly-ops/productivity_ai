from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import User
from app.schemas import (
    AnomalyResponse,
    BurnoutRiskResponse,
    DailySummaryResponse,
    IdleEpisodeCreate,
    IdleEpisodeResponse,
    WorkLogCreate,
    WorkLogResponse,
)
from app.services import (
    create_idle_episode,
    create_work_log,
    get_anomaly_report,
    get_burnout_report,
    get_daily_summary,
)

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.post("/idle-episodes", response_model=IdleEpisodeResponse)
def create_idle_episode_route(
    payload: IdleEpisodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return create_idle_episode(db, current_user.public_id, payload)


@router.post("/work-logs", response_model=WorkLogResponse)
def create_work_log_route(
    payload: WorkLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return create_work_log(db, current_user.public_id, payload)


@router.get("/me/daily-summary", response_model=DailySummaryResponse)
def get_daily_summary_route(
    target_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_daily_summary(db, current_user.public_id, target_date)


@router.get("/me/burnout", response_model=BurnoutRiskResponse)
def get_burnout_route(
    end_date: date = Query(default_factory=date.today),
    lookback_days: int = Query(default=14, ge=2, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_burnout_report(db, current_user.public_id, end_date, lookback_days)


@router.get("/me/anomaly", response_model=AnomalyResponse)
def get_anomaly_route(
    target_date: date = Query(default_factory=date.today),
    lookback_days: int = Query(default=30, ge=3, le=120),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_anomaly_report(db, current_user.public_id, target_date, lookback_days)
