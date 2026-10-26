"""Offer service: create, list, get, respond to offers."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.codes import generate_actor_code
from app.models.models import AppUser, Offer, MatchRun, Recipient
from app.schemas.schemas import OfferOut, OfferRespondRequest, PaginatedResponse
from app.audit.writer import write_audit

OFFER_WINDOW_HOURS = 4  # How long a doctor has to respond


async def create_offers_for_match(
    db: AsyncSession, match_run: MatchRun, current_user: AppUser
) -> list[Offer]:
    """Create pending offers for all ranked recipients from a match run."""
    ranked = match_run.result_json.get("ranked", [])
    offers = []
    for item in ranked:
        recipient_code = item["recipient_code"]
        recipient_result = await db.execute(
            select(Recipient).where(Recipient.recipient_code == recipient_code)
        )
        recipient = recipient_result.scalar_one_or_none()
        if not recipient:
            continue
        offer = Offer(
            match_run_id=match_run.id,
            recipient_id=recipient.id,
            recipient_code=recipient_code,
            rank=item["rank"],
            status="pending",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=OFFER_WINDOW_HOURS),
        )
        db.add(offer)
        offers.append(offer)
    await db.flush()
    return offers


async def list_offers(
    db: AsyncSession,
    current_user: AppUser,
    page: int,
    page_size: int,
    status_filter: str | None,
) -> PaginatedResponse:
    query = select(Offer)
    if status_filter:
        query = query.where(Offer.status == status_filter)
    query = query.order_by(Offer.created_at.desc())

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    items = (
        await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    ).scalars().all()
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[OfferOut.model_validate(o) for o in items],
    )


async def get_offer(db: AsyncSession, offer_id: str) -> Offer:
    result = await db.execute(select(Offer).where(Offer.id == offer_id))
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    return offer


async def respond_to_offer(
    db: AsyncSession, offer_id: str, body: OfferRespondRequest, current_user: AppUser
) -> Offer:
    offer = await get_offer(db, offer_id)

    if offer.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Offer is already '{offer.status}'. Cannot respond.",
        )
    if offer.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Offer has expired."
        )

    offer.status = body.response  # "accepted" or "declined"
    offer.responded_at = datetime.now(timezone.utc)
    offer.reason = body.reason

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action=f"offer.{body.response}",
        payload={
            "offer_id": offer_id,
            "recipient_code": offer.recipient_code,
            "reason": body.reason,
        },
    )
    await db.commit()
    await db.refresh(offer)

    # If declined, trigger next candidate via worker
    if body.response == "declined":
        from app.workers.offer_timers import advance_to_next_candidate
        advance_to_next_candidate.delay(offer_id)

    return offer
