from __future__ import annotations

from app.config import settings
from app.utils import clamp, safe_divide


def build_feature_vector(aggregates: dict[str, float]) -> dict[str, float]:
    tracked_minutes = max(aggregates.get("tracked_minutes", 0.0), 0.0)
    active_minutes = max(aggregates.get("active_minutes", 0.0), 0.0)
    deep_work_minutes = max(aggregates.get("deep_work_minutes", 0.0), 0.0)
    assigned_tasks = max(aggregates.get("assigned_tasks", 0.0), 0.0)
    completed_tasks = max(aggregates.get("completed_tasks", 0.0), 0.0)
    context_switch_count = max(aggregates.get("context_switch_count", 0.0), 0.0)
    isolation_minutes = max(aggregates.get("total_isolation_minutes", 0.0), 0.0)

    deep_work_norm = clamp(
        safe_divide(deep_work_minutes, float(settings.deep_work_target_minutes))
    )

    manual_engagement = aggregates.get("engagement_score")
    if manual_engagement is None:
        engagement_norm = clamp(safe_divide(active_minutes, tracked_minutes))
    else:
        engagement_norm = clamp(float(manual_engagement))

    if assigned_tasks <= 0:
        task_completion_norm = 0.0
    else:
        task_completion_norm = clamp(safe_divide(completed_tasks, assigned_tasks))

    switch_norm = clamp(safe_divide(context_switch_count, float(settings.context_switch_target)))
    isolation_rate = clamp(safe_divide(isolation_minutes, tracked_minutes))

    return {
        "deep_work_norm": round(deep_work_norm, 4),
        "engagement_norm": round(engagement_norm, 4),
        "task_completion_norm": round(task_completion_norm, 4),
        "switch_norm": round(switch_norm, 4),
        "isolation_rate": round(isolation_rate, 4),
        "tracked_minutes": round(tracked_minutes, 2),
        "active_minutes": round(active_minutes, 2),
        "deep_work_minutes": round(deep_work_minutes, 2),
    }
