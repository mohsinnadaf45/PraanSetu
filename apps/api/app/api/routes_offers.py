"""Offer routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.permissions import require_roles, Role
from app.deps import DbSession
from app.schemas.schemas import OfferRespondRequest, OfferOut, PaginatedResponse
from app.services import offer_service

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("", response_model=PaginatedResponse)
async def list_offers(
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
):
    return await offer_service.list_offers(db, current_user, page, page_size, status)


@router.get("/{offer_id}", response_model=OfferOut)
async def get_offer(
    offer_id: str,
    db: DbSession,
    current_user=Depends(require_roles(Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    return await offer_service.get_offer(db, offer_id)


@router.post("/{offer_id}/respond", response_model=OfferOut)
async def respond_to_offer(
    offer_id: str,
    body: OfferRespondRequest,
    db: DbSession,
    current_user=Depends(require_roles(Role.DOCTOR, Role.ADMIN)),
):
    return await offer_service.respond_to_offer(db, offer_id, body, current_user)
