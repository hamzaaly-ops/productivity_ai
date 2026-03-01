from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_active_user
from app.database import get_async_db
from app.models import Heartbeat, User, WorkSession
from app.models import SessionStatus
from app.schemas import HeartbeatCreate

router = APIRouter(prefix="/heartbeat", tags=["Tracking"])


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def heartbeat(
    payload: HeartbeatCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    result = await db.execute(
        select(WorkSession)
        .where(
            WorkSession.id == payload.session_id,
            WorkSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active.",
        )

    h = Heartbeat(
        session_id=payload.session_id,
        timestamp=payload.timestamp,
        is_idle=payload.is_idle,
        meta_data=payload.meta_data,
    )
    db.add(h)
    await db.flush()
    return {"ok": True}
