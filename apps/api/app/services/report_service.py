"""Report service: fairness and waiting-time reports."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from statistics import median
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Offer, Recipient, MatchRun
from app.schemas.schemas import FairnessReportOut


async def fairness_report(
    db: AsyncSession,
    start: datetime | None,
    end: datetime | None,
) -> FairnessReportOut:
    now = datetime.now(timezone.utc)
    if not start:
        start = now - timedelta(days=30)
    if not end:
        end = now

    # Match runs in period
    mr_result = await db.execute(
        select(func.count()).select_from(MatchRun).where(
            MatchRun.created_at.between(start, end)
        )
    )
    total_match_runs = mr_result.scalar_one()

    # Offers in period
    offers_result = await db.execute(
        select(Offer).where(Offer.created_at.between(start, end))
    )
    offers = offers_result.scalars().all()
    total_offers = len(offers)
    offers_accepted = sum(1 for o in offers if o.status == "accepted")
    offers_declined = sum(1 for o in offers if o.status == "declined")
    offers_expired = sum(1 for o in offers if o.status == "expired")

    # Median waiting time for transplanted recipients
    recipients_result = await db.execute(
        select(Recipient).where(Recipient.status == "transplanted")
    )
    transplanted = recipients_result.scalars().all()
    waiting_days_list = [
        (now - r.listed_at).days for r in transplanted if r.listed_at
    ]
    median_waiting = median(waiting_days_list) if waiting_days_list else 0.0

    # By blood group
    by_bg: dict[str, Any] = {}
    bg_result = await db.execute(
        select(Recipient.blood_group, func.count(Recipient.id).label("count"))
        .where(Recipient.status == "transplanted")
        .group_by(Recipient.blood_group)
    )
    for row in bg_result:
        by_bg[row[0]] = row[1]

    # By organ
    by_organ: dict[str, Any] = {}
    organ_result = await db.execute(
        select(Recipient.organ, func.count(Recipient.id).label("count"))
        .where(Recipient.status == "transplanted")
        .group_by(Recipient.organ)
    )
    for row in organ_result:
        by_organ[row[0]] = row[1]

    return FairnessReportOut(
        period_start=start,
        period_end=end,
        total_match_runs=total_match_runs,
        total_offers=total_offers,
        offers_accepted=offers_accepted,
        offers_declined=offers_declined,
        offers_expired=offers_expired,
        median_waiting_days=float(median_waiting),
        by_blood_group=by_bg,
        by_organ=by_organ,
    )
