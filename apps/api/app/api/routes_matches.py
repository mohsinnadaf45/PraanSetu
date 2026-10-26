"""Match routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.permissions import require_roles, Role
from app.deps import DbSession
from app.schemas.schemas import MatchRunRequest, MatchRunOut, PaginatedResponse
from app.services import match_service

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("/run", response_model=MatchRunOut, status_code=201)
async def run_match(
    body: MatchRunRequest,
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.ADMIN)),
):
    return await match_service.run_match(db, body, current_user)


@router.get("/{match_id}", response_model=MatchRunOut)
async def get_match(
    match_id: str,
    db: DbSession,
    current_user=Depends(require_roles(Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    return await match_service.get_match(db, match_id)


@router.get("", response_model=PaginatedResponse)
async def list_matches(
    db: DbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
    page: int = 1,
    page_size: int = 20,
):
    return await match_service.list_matches(db, page, page_size)
