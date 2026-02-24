from __future__ import annotations

from app.config import settings
from app.utils import clamp


def calculate_productivity_score(features: dict[str, float]) -> tuple[float, dict[str, float]]:
    deep_work_component = settings.deep_work_weight * features.get("deep_work_norm", 0.0)
    engagement_component = settings.engagement_weight * features.get("engagement_norm", 0.0)
    task_component = settings.task_weight * features.get("task_completion_norm", 0.0)
    switch_component = settings.switch_penalty * features.get("switch_norm", 0.0)

    score_raw = deep_work_component + engagement_component + task_component - switch_component
    score_normalized = clamp(score_raw)
    score_100 = round(score_normalized * 100, 2)

    return score_100, {
        "deep_work_component": round(deep_work_component, 4),
        "engagement_component": round(engagement_component, 4),
        "task_component": round(task_component, 4),
        "switch_penalty_component": round(switch_component, 4),
        "score_raw": round(score_raw, 4),
    }
