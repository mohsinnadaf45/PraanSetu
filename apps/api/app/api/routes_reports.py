"""Reports routes."""
from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, Query
from app.core.permissions import require_roles, Role
from app.deps import DbSession
from app.schemas.schemas import FairnessReportOut
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/fairness", response_model=FairnessReportOut)
async def fairness_report(
    db: DbSession,
    current_user=Depends(require_roles(Role.AUTHORITY, Role.AUDITOR, Role.ADMIN)),
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
):
    return await report_service.fairness_report(db, start, end)
