from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from passlib.context import CryptContext
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_async_db
from app.models import User
from app.schemas import (
    TokenResponse,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(subject: str) -> str:
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    expires = now + datetime.timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        user_id=str(user.id),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        sub = payload.get("sub")
        if not sub:
            raise credentials_exception
    except jwt.PyJWTError as exc:
        raise credentials_exception from exc

    result = await db.execute(select(User).where(User.id == sub))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user.")
    return current_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_async_db),
) -> UserResponse:
    # Check username exists
    r = await db.execute(select(User).where(User.username == payload.username))
    if r.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Username already exists.")
    # Check email exists
    r = await db.execute(select(User).where(User.email == payload.email))
    if r.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already exists.")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=_hash_password(payload.password),
        full_name=payload.full_name,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return _to_user_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db),
) -> TokenResponse:
    result = await db.execute(
        select(User).where(
            or_(
                User.username == form_data.username,
                User.email == form_data.username,
            )
        )
    )
    user = result.scalar_one_or_none()
    if not user or not _verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled.")

    token = _create_token(str(user.id))
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_active_user)) -> UserResponse:
    return _to_user_response(current_user)
