"""Audit log routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from app.core.permissions import require_roles, Role
from app.deps import DbSession
from app.schemas.schemas import AuditLogOut, AuditVerifyResponse, PaginatedResponse
from app.audit import chain as audit_chain
from app.audit import writer as audit_writer

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=PaginatedResponse)
async def list_audit(
    db: DbSession,
    current_user=Depends(require_roles(Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
    page: int = 1,
    page_size: int = 50,
    action: str | None = None,
    actor_code: str | None = None,
):
    from app.models.models import AuditLog
    from sqlalchemy import select, func

    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    if actor_code:
        query = query.where(AuditLog.actor_code == actor_code)
    query = query.order_by(AuditLog.time.desc())

    count_query = select(func.count()).select_from(AuditLog)
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()

    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[AuditLogOut.model_validate(i) for i in items],
    )


@router.get("/{entry_id}", response_model=AuditLogOut)
async def get_audit_entry(
    entry_id: str,
    db: DbSession,
    current_user=Depends(require_roles(Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    from app.models.models import AuditLog
    from sqlalchemy import select
    result = await db.execute(select(AuditLog).where(AuditLog.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit entry not found")
    return AuditLogOut.model_validate(entry)


@router.post("/verify", response_model=AuditVerifyResponse)
async def verify_audit_chain(
    db: DbSession,
    current_user=Depends(require_roles(Role.AUDITOR, Role.AUTHORITY, Role.ADMIN)),
):
    return await audit_chain.verify_chain(db)
