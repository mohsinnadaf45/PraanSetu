"""Donor routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.permissions import require_roles, Role
from app.deps import CurrentUser, DbSession
from app.schemas.schemas import DonorCreate, DonorOut, DonorUpdate, PaginatedResponse
from app.services import donor_service

router = APIRouter(prefix="/donors", tags=["donors"])


@router.get("", response_model=PaginatedResponse)
async def list_donors(
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
    page: int = 1,
    page_size: int = 20,
    organ: str | None = None,
    status: str | None = None,
):
    return await donor_service.list_donors(db, current_user, page, page_size, organ, status)


@router.post("", response_model=DonorOut, status_code=201)
async def create_donor(
    body: DonorCreate,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.ADMIN)),
):
    return await donor_service.create_donor(db, body, current_user)


@router.get("/{donor_code}", response_model=DonorOut)
async def get_donor(
    donor_code: str,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    return await donor_service.get_donor(db, donor_code)


@router.patch("/{donor_code}", response_model=DonorOut)
async def update_donor(
    donor_code: str,
    body: DonorUpdate,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.ADMIN)),
):
    return await donor_service.update_donor(db, donor_code, body, current_user)
