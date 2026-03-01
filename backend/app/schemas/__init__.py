from __future__ import annotations

from datetime import date, datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: str = Field(min_length=5, max_length=256)
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=128)


class UserLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool


class IdleEpisodeCreate(BaseModel):
    idle_started_at: datetime
    idle_ended_at: datetime


class IdleEpisodeResponse(BaseModel):
    id: int
    user_id: str
    idle_started_at: datetime
    idle_ended_at: datetime
    idle_minutes: float

    model_config = {"from_attributes": True}


class WorkLogCreate(BaseModel):
    session_started_at: datetime
    session_ended_at: datetime
    tracked_minutes: Optional[float] = Field(default=None, ge=0)
    active_minutes: float = Field(default=0, ge=0)
    deep_work_minutes: float = Field(default=0, ge=0)
    engagement_score: Optional[float] = Field(default=None, ge=0, le=1)
    context_switch_count: int = Field(default=0, ge=0)
    assigned_tasks: int = Field(default=0, ge=0)
    completed_tasks: int = Field(default=0, ge=0)
    break_minutes: float = Field(default=0, ge=0)
    late_night_minutes: float = Field(default=0, ge=0)
    weekend_minutes: float = Field(default=0, ge=0)


class WorkLogResponse(BaseModel):
    id: int
    user_id: str
    session_started_at: datetime
    session_ended_at: datetime
    tracked_minutes: float
    active_minutes: float
    deep_work_minutes: float
    engagement_score: Optional[float]
    context_switch_count: int
    assigned_tasks: int
    completed_tasks: int
    break_minutes: float
    late_night_minutes: float
    weekend_minutes: float

    model_config = {"from_attributes": True}


class BurnoutRiskResponse(BaseModel):
    risk_level: str
    risk_score: int
    factors: list[str]
    lookback_days: int


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    method: str
    anomaly_score: float
    details: str
    lookback_days: int


class DailySummaryResponse(BaseModel):
    user_id: str
    date: date
    isolation_count: int
    total_isolation_minutes: float
    avg_isolation_duration_minutes: float
    longest_isolation_minutes: float
    isolation_rate: float
    tracked_minutes: float
    active_minutes: float
    deep_work_minutes: float
    deep_work_norm: float
    engagement_norm: float
    task_completion_norm: float
    switch_norm: float
    productivity_score: float
    breakdown: dict[str, float]


# --- V1 Session & Heartbeat schemas ---


class SessionStart(BaseModel):
    project_name: Optional[str] = Field(default=None, max_length=256)


class SessionRead(BaseModel):
    id: UUID
    user_id: UUID
    start_time: datetime
    end_time: Optional[datetime]
    status: str
    project_name: Optional[str]

    model_config = {"from_attributes": True}


class SessionEnd(BaseModel):
    end_time: datetime


class SessionEndRequest(BaseModel):
    session_id: UUID
    end_time: datetime


class HeartbeatCreate(BaseModel):
    session_id: UUID
    timestamp: datetime
    is_idle: bool = False
    meta_data: Optional[dict[str, Any]] = None


class HeartbeatRead(BaseModel):
    id: int
    session_id: UUID
    timestamp: datetime
    is_idle: bool
    meta_data: Optional[dict[str, Any]]

    model_config = {"from_attributes": True}

