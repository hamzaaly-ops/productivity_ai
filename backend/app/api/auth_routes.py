from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth import authenticate_user, create_access_token, get_current_active_user, register_user
from app.database import get_db
from app.models import User
from app.schemas import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        user_id=user.public_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, payload)
    return _to_user_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.username, payload.password)
    access_token = create_access_token(subject=user.public_id)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return _to_user_response(current_user)

