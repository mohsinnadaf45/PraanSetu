"""Role-based access control (RBAC) helpers."""
from __future__ import annotations

from enum import StrEnum
from typing import Callable

from fastapi import Depends, HTTPException, status

from app.deps import get_current_user
from app.models.models import AppUser


class Role(StrEnum):
    COORDINATOR = "coordinator"
    DOCTOR = "doctor"
    COMMITTEE = "committee"
    AUDITOR = "auditor"
    AUTHORITY = "authority"
    ADMIN = "admin"


# Role hierarchy: higher index = more permissions when stacking
ROLE_ORDER = [
    Role.COORDINATOR,
    Role.DOCTOR,
    Role.COMMITTEE,
    Role.AUDITOR,
    Role.AUTHORITY,
    Role.ADMIN,
]


def require_roles(*roles: Role) -> Callable:
    """FastAPI dependency that checks the current user has one of the given roles."""

    async def _check(current_user: AppUser = Depends(get_current_user)) -> AppUser:
        if current_user.role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not allowed to perform this action.",
            )
        return current_user

    return _check


def require_any_role() -> Callable:
    """Allows any authenticated user."""

    async def _check(current_user: AppUser = Depends(get_current_user)) -> AppUser:
        return current_user

    return _check
