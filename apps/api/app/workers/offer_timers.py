"""Celery tasks: offer timers and expiry."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import structlog
from sqlalchemy import select

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="app.workers.offer_timers.expire_pending_offers", bind=True, max_retries=3)
def expire_pending_offers(self):
    """Mark pending offers that have passed their deadline as 'expired' and
    trigger the next candidate."""
    _run_async(_expire_pending_offers())


async def _expire_pending_offers():
    from app.db.session import AsyncSessionLocal
    from app.models.models import Offer
    from app.audit.writer import write_audit

    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Offer)
            .where(Offer.status == "pending")
            .where(Offer.expires_at <= now)
        )
        expired_offers = result.scalars().all()

        for offer in expired_offers:
            offer.status = "expired"
            await write_audit(
                db,
                actor_code="SYS-TIMER",
                action="offer.expired",
                payload={"offer_id": offer.id, "recipient_code": offer.recipient_code},
            )
            # Advance to next candidate
            await _advance_next(db, offer)

        if expired_offers:
            await db.commit()
            logger.info("offers_expired", count=len(expired_offers))


async def _advance_next(db, expired_offer):
    """Find the next ranked pending offer for the same match run and activate it."""
    from app.models.models import Offer
    from app.workers.notifications import send_offer_notification

    result = await db.execute(
        select(Offer)
        .where(Offer.match_run_id == expired_offer.match_run_id)
        .where(Offer.status == "pending")
        .where(Offer.rank > expired_offer.rank)
        .order_by(Offer.rank.asc())
        .limit(1)
    )
    next_offer = result.scalar_one_or_none()
    if next_offer:
        send_offer_notification.delay(next_offer.id)
        logger.info("next_candidate_notified", offer_id=next_offer.id)


@celery_app.task(name="app.workers.offer_timers.advance_to_next_candidate")
def advance_to_next_candidate(declined_offer_id: str):
    """Called when a doctor declines; immediately offer next candidate."""
    _run_async(_advance_to_next_candidate(declined_offer_id))


async def _advance_to_next_candidate(declined_offer_id: str):
    from app.db.session import AsyncSessionLocal
    from app.models.models import Offer
    from app.workers.notifications import send_offer_notification

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Offer).where(Offer.id == declined_offer_id))
        declined = result.scalar_one_or_none()
        if not declined:
            return
        await _advance_next(db, declined)
