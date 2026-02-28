from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_active_user
from app.database import get_async_db
from app.models import User, WorkSession
from app.models import SessionStatus
from app.schemas import (
    SessionEndRequest,
    SessionRead,
    SessionStart,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


async def _get_session_or_404(
    db: AsyncSession,
    session_id: UUID,
    user_id: UUID,
) -> WorkSession:
    result = await db.execute(
        select(WorkSession)
        .where(WorkSession.id == session_id, WorkSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )
    return session


@router.post("/start", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def start_session(
    payload: SessionStart | None = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> SessionRead:
    # Check no active session
    result = await db.execute(
        select(WorkSession)
        .where(
            WorkSession.user_id == current_user.id,
            WorkSession.status == SessionStatus.ACTIVE,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An active session already exists.",
        )

    now = datetime.now(timezone.utc)
    session = WorkSession(
        user_id=current_user.id,
        start_time=now,
        end_time=None,
        status=SessionStatus.ACTIVE,
        project_name=payload.project_name if payload else None,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)

    return SessionRead(
        id=session.id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        status=session.status.value,
        project_name=session.project_name,
    )


@router.post("/end", response_model=SessionRead)
async def end_session(
    payload: SessionEndRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> SessionRead:
    session = await _get_session_or_404(db, payload.session_id, current_user.id)
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active.",
        )
    if payload.end_time < session.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_time cannot be before start_time.",
        )

    session.end_time = payload.end_time
    session.status = SessionStatus.COMPLETED
    await db.flush()
    await db.refresh(session)

    return SessionRead(
        id=session.id,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        status=session.status.value,
        project_name=session.project_name,
    )
