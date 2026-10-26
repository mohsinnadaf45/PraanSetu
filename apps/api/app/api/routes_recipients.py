"""Recipient routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.permissions import require_roles, Role
from app.deps import DbSession
from app.schemas.schemas import RecipientCreate, RecipientOut, RecipientUpdate, PaginatedResponse
from app.services import recipient_service

router = APIRouter(prefix="/recipients", tags=["recipients"])


@router.get("", response_model=PaginatedResponse)
async def list_recipients(
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
    page: int = 1,
    page_size: int = 20,
    organ: str | None = None,
    status: str | None = None,
):
    return await recipient_service.list_recipients(db, current_user, page, page_size, organ, status)


@router.post("", response_model=RecipientOut, status_code=201)
async def create_recipient(
    body: RecipientCreate,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.ADMIN)),
):
    return await recipient_service.create_recipient(db, body, current_user)


@router.get("/{recipient_code}", response_model=RecipientOut)
async def get_recipient(
    recipient_code: str,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    return await recipient_service.get_recipient(db, recipient_code)


@router.patch("/{recipient_code}", response_model=RecipientOut)
async def update_recipient(
    recipient_code: str,
    body: RecipientUpdate,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.ADMIN)),
):
    return await recipient_service.update_recipient(db, recipient_code, body, current_user)
