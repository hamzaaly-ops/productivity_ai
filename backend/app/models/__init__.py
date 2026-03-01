from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, Boolean, DateTime, Float, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SessionStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    public_id: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        nullable=False,
        default=lambda: str(uuid4()),
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    work_sessions: Mapped[list["WorkSession"]] = relationship(
        "WorkSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class WorkSession(Base):
    __tablename__ = "work_sessions"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    end_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus),
        nullable=False,
        default=SessionStatus.ACTIVE,
    )
    project_name: Mapped[str | None] = mapped_column(String(256), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="work_sessions")
    heartbeats: Mapped[list["Heartbeat"]] = relationship(
        "Heartbeat",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class Heartbeat(Base):
    __tablename__ = "heartbeats"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        index=True,
    )
    session_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("work_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    is_idle: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    meta_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    session: Mapped["WorkSession"] = relationship(
        "WorkSession",
        back_populates="heartbeats",
    )


# Legacy models (used by existing activity routes)
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
