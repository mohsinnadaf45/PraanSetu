"""Decision service: committee approval/rejection."""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.codes import generate_actor_code
from app.models.models import AppUser, Decision, Offer
from app.schemas.schemas import DecisionCreate, DecisionOut, PaginatedResponse
from app.audit.writer import write_audit


async def create_decision(
    db: AsyncSession, body: DecisionCreate, current_user: AppUser
) -> Decision:
    # Verify offer exists
    offer_result = await db.execute(select(Offer).where(Offer.id == body.offer_id))
    offer = offer_result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    decision = Decision(
        offer_id=body.offer_id,
        committee_user_id=current_user.id,
        outcome=body.outcome,
        reason=body.reason,
    )
    db.add(decision)
    await db.flush()

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action=f"decision.{body.outcome}",
        payload={
            "decision_id": decision.id,
            "offer_id": body.offer_id,
            "outcome": body.outcome,
            "reason": body.reason,
        },
    )
    await db.commit()
    await db.refresh(decision)
    return decision


async def list_decisions(db: AsyncSession, page: int, page_size: int) -> PaginatedResponse:
    total = (await db.execute(select(func.count()).select_from(Decision))).scalar_one()
    items = (
        await db.execute(
            select(Decision)
            .order_by(Decision.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[DecisionOut.model_validate(d) for d in items],
    )


async def get_decision(db: AsyncSession, decision_id: str) -> Decision:
    result = await db.execute(select(Decision).where(Decision.id == decision_id))
    decision = result.scalar_one_or_none()
    if not decision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Decision not found")
    return decision
