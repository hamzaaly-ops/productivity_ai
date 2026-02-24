from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(
        String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid4())
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class IdleEpisode(Base):
    __tablename__ = "idle_episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    idle_started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    idle_ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    idle_minutes: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class WorkLog(Base):
    __tablename__ = "work_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    session_started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    session_ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    tracked_minutes: Mapped[float] = mapped_column(Float, nullable=False)
    active_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    deep_work_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    engagement_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    context_switch_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    assigned_tasks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_tasks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    break_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    late_night_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    weekend_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
