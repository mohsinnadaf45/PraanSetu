"""Match service: calls matching engine and stores result."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.codes import generate_actor_code
from app.models.models import AppUser, Donor, MatchRun, Recipient, RuleVersion
from app.schemas.schemas import MatchRunOut, MatchRunRequest, PaginatedResponse
from app.audit.writer import write_audit


async def run_match(
    db: AsyncSession, body: MatchRunRequest, current_user: AppUser
) -> MatchRun:
    # Load donor
    donor_result = await db.execute(
        select(Donor).where(Donor.donor_code == body.donor_code)
    )
    donor = donor_result.scalar_one_or_none()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if donor.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Donor is not available"
        )

    # Load active rule version for this organ
    rv_result = await db.execute(
        select(RuleVersion)
        .where(RuleVersion.organ == donor.organ)
        .where(RuleVersion.effective_from <= datetime.now(timezone.utc))
        .order_by(RuleVersion.effective_from.desc())
        .limit(1)
    )
    rule_version = rv_result.scalar_one_or_none()
    if not rule_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No approved rule version for organ '{donor.organ}'",
        )

    # Load waiting recipients for the same organ
    recipients_result = await db.execute(
        select(Recipient)
        .where(Recipient.organ == donor.organ)
        .where(Recipient.status == "waiting")
    )
    recipients = recipients_result.scalars().all()

    # Call matching engine
    result_json = _call_matching_engine(donor, recipients, rule_version)

    # Save match run
    match_run = MatchRun(
        donor_id=donor.id,
        donor_code=donor.donor_code,
        rule_version_id=rule_version.id,
        result_json=result_json,
        run_by=current_user.id,
    )
    db.add(match_run)
    await db.flush()

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action="match.run",
        payload={
            "match_run_id": match_run.id,
            "donor_code": donor.donor_code,
            "rule_version_id": rule_version.id,
            "ranked_count": len(result_json.get("ranked", [])),
        },
    )
    await db.commit()
    await db.refresh(match_run)
    return match_run


def _call_matching_engine(
    donor: Donor, recipients: list[Recipient], rule_version: RuleVersion
) -> dict[str, Any]:
    """Translate DB models to matching engine types and call engine."""
    try:
        from praansetu_matching.engine import run_matching
        from praansetu_matching.models import (
            DonorInput,
            RecipientInput,
        )

        donor_input = DonorInput(
            donor_code=donor.donor_code,
            organ=donor.organ,
            blood_group=donor.blood_group,
            size_kg=donor.size_kg,
            age_years=donor.age_years,
            test_results=donor.test_results,
        )

        recipient_inputs = [
            RecipientInput(
                recipient_code=r.recipient_code,
                organ=r.organ,
                blood_group=r.blood_group,
                size_kg=r.size_kg,
                age_years=r.age_years,
                hla=r.hla,
                urgency=r.urgency,
                listed_at=r.listed_at,
            )
            for r in recipients
        ]

        result = run_matching(donor_input, recipient_inputs, rule_version.version_tag)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matching engine error: {e}",
        )


async def get_match(db: AsyncSession, match_id: str) -> MatchRun:
    result = await db.execute(select(MatchRun).where(MatchRun.id == match_id))
    match_run = result.scalar_one_or_none()
    if not match_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match run not found")
    return match_run


async def list_matches(db: AsyncSession, page: int, page_size: int) -> PaginatedResponse:
    total = (await db.execute(select(func.count()).select_from(MatchRun))).scalar_one()
    items = (
        await db.execute(
            select(MatchRun)
            .order_by(MatchRun.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[MatchRunOut.model_validate(m) for m in items],
    )
