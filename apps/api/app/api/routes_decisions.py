"""Decision routes (committee)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.permissions import require_roles, Role
from app.deps import DbSession
from app.schemas.schemas import DecisionCreate, DecisionOut, PaginatedResponse
from app.services import decision_service

router = APIRouter(prefix="/decisions", tags=["decisions"])


@router.post("", response_model=DecisionOut, status_code=201)
async def create_decision(
    body: DecisionCreate,
    db: DbSession,
    current_user=Depends(require_roles(Role.COMMITTEE, Role.ADMIN)),
):
    return await decision_service.create_decision(db, body, current_user)


@router.get("", response_model=PaginatedResponse)
async def list_decisions(
    db: DbSession,
    current_user=Depends(require_roles(Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
    page: int = 1,
    page_size: int = 20,
):
    return await decision_service.list_decisions(db, page, page_size)


@router.get("/{decision_id}", response_model=DecisionOut)
async def get_decision(
    decision_id: str,
    db: DbSession,
    current_user=Depends(require_roles(Role.COMMITTEE, Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    return await decision_service.get_decision(db, decision_id)
