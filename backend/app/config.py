from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./productivity.db")
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "dev-only-change-this-secret")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    idle_threshold_minutes: int = int(os.getenv("IDLE_THRESHOLD_MINUTES", "5"))
    deep_work_target_minutes: int = int(os.getenv("DEEP_WORK_TARGET_MINUTES", "240"))
    context_switch_target: int = int(os.getenv("CONTEXT_SWITCH_TARGET", "50"))
    deep_work_weight: float = float(os.getenv("DEEP_WORK_WEIGHT", "0.4"))
    engagement_weight: float = float(os.getenv("ENGAGEMENT_WEIGHT", "0.3"))
    task_weight: float = float(os.getenv("TASK_WEIGHT", "0.3"))
    switch_penalty: float = float(os.getenv("SWITCH_PENALTY", "0.2"))


settings = Settings()
