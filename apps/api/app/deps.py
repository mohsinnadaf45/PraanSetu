"""Shared FastAPI dependencies (DB sessions, current user extraction)."""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import decode_token
from app.db.session import get_db, get_vault_db

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: AsyncSession = Depends(get_db),
):
    """Decode JWT and return the AppUser from the database."""
    from app.models.models import AppUser  # local import to avoid circular

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(AppUser).where(AppUser.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


# Type aliases
CurrentUser = Annotated[object, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
VaultDbSession = Annotated[AsyncSession, Depends(get_vault_db)]
