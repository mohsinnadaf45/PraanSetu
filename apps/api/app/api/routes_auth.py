"""Auth routes: login (password), MFA verify, refresh, TOTP setup."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import (
    create_access_token,
    create_mfa_pending_token,
    create_refresh_token,
    decode_token,
    generate_totp_secret,
    get_totp_uri,
    hash_password,
    verify_password,
    verify_totp,
)
from app.deps import CurrentUser, DbSession
from app.models.models import AppUser
from app.schemas.schemas import (
    LoginRequest,
    MFAVerifyRequest,
    MFAPendingResponse,
    RefreshTokenRequest,
    TOTPEnableRequest,
    TOTPSetupResponse,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=MFAPendingResponse | TokenResponse)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(request: Request, body: LoginRequest, db: DbSession):
    result = await db.execute(select(AppUser).where(AppUser.email == body.email))
    user: AppUser | None = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Lockout check
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked. Try again later.",
        )

    if not verify_password(body.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            from datetime import timedelta
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=settings.LOCKOUT_DURATION_MINUTES
            )
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Reset lockout on success
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.commit()

    if user.mfa_enabled:
        pending_token = create_mfa_pending_token(user.id)
        return MFAPendingResponse(mfa_pending_token=pending_token)

    # No MFA: issue tokens directly
    access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    refresh_token = create_refresh_token(subject=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/mfa", response_model=TokenResponse)
async def verify_mfa(body: MFAVerifyRequest, db: DbSession):
    try:
        payload = decode_token(body.mfa_pending_token)
        if payload.get("type") != "mfa_pending":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = payload["sub"]
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(AppUser).where(AppUser.id == user_id))
    user: AppUser | None = result.scalar_one_or_none()
    if not user or not user.totp_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="MFA not set up")

    if not verify_totp(user.totp_secret, body.totp_code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid TOTP code")

    access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    refresh_token = create_refresh_token(subject=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshTokenRequest, db: DbSession):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = payload["sub"]
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(AppUser).where(AppUser.id == user_id))
    user: AppUser | None = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    new_refresh = create_refresh_token(subject=user.id)
    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/totp/setup", response_model=TOTPSetupResponse)
async def setup_totp(current_user: CurrentUser, db: DbSession):
    user: AppUser = current_user  # type: ignore
    if user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA already enabled")
    secret = generate_totp_secret()
    user.totp_secret = secret
    await db.commit()
    return TOTPSetupResponse(totp_secret=secret, totp_uri=get_totp_uri(secret, user.email))


@router.post("/totp/enable")
async def enable_totp(body: TOTPEnableRequest, current_user: CurrentUser, db: DbSession):
    user: AppUser = current_user  # type: ignore
    if not user.totp_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="TOTP not set up")
    if not verify_totp(user.totp_secret, body.totp_code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid TOTP code")
    user.mfa_enabled = True
    await db.commit()
    return {"message": "MFA enabled successfully"}
