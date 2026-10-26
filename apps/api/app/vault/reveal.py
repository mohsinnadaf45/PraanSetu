"""Identity reveal: request → approval → access workflow."""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.codes import generate_actor_code
from app.models.vault_models import IdentityReveal
from app.schemas.schemas import RevealApproveRequest, RevealOut, RevealRequest


async def request_reveal(
    vault_db: AsyncSession, body: RevealRequest, current_user
) -> IdentityReveal:
    actor_code = generate_actor_code(current_user.role, current_user.id)
    reveal = IdentityReveal(
        code=body.code,
        requested_by=actor_code,
        reason=body.reason,
        status="pending",
    )
    vault_db.add(reveal)
    await vault_db.commit()
    await vault_db.refresh(reveal)
    return reveal


async def approve_reveal(
    vault_db: AsyncSession,
    reveal_id: str,
    body: RevealApproveRequest,
    current_user,
) -> IdentityReveal:
    result = await vault_db.execute(
        select(IdentityReveal).where(IdentityReveal.id == reveal_id)
    )
    reveal = result.scalar_one_or_none()
    if not reveal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reveal request not found")
    if reveal.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Reveal is already '{reveal.status}'",
        )

    actor_code = generate_actor_code(current_user.role, current_user.id)
    reveal.approved_by = actor_code
    reveal.status = "approved" if body.approved else "rejected"
    await vault_db.commit()
    await vault_db.refresh(reveal)
    return reveal


async def get_reveal(vault_db: AsyncSession, reveal_id: str) -> IdentityReveal:
    result = await vault_db.execute(
        select(IdentityReveal).where(IdentityReveal.id == reveal_id)
    )
    reveal = result.scalar_one_or_none()
    if not reveal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reveal request not found")
    return reveal
