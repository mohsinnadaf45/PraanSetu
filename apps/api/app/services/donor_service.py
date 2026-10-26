"""Donor service: business logic for donor CRUD."""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.codes import generate_donor_code
from app.models.models import Donor, AppUser
from app.schemas.schemas import DonorCreate, DonorOut, DonorUpdate, PaginatedResponse
from app.audit.writer import write_audit
from app.core.codes import generate_actor_code


async def create_donor(
    db: AsyncSession, body: DonorCreate, current_user: AppUser
) -> Donor:
    code = generate_donor_code()
    # Ensure uniqueness
    while (await db.execute(select(Donor).where(Donor.donor_code == code))).scalar_one_or_none():
        code = generate_donor_code()

    donor = Donor(
        donor_code=code,
        hospital_id=current_user.hospital_id,
        organ=body.organ,
        blood_group=body.blood_group,
        size_kg=body.size_kg,
        age_years=body.age_years,
        test_results=body.test_results,
        status="available",
        registered_by=current_user.id,
    )
    db.add(donor)
    await db.flush()

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action="donor.created",
        payload={"donor_code": code, "organ": body.organ},
    )
    await db.commit()
    await db.refresh(donor)
    return donor


async def list_donors(
    db: AsyncSession,
    current_user: AppUser,
    page: int,
    page_size: int,
    organ: str | None,
    status_filter: str | None,
) -> PaginatedResponse:
    query = select(Donor)

    # Non-admin/auditor users only see their hospital
    if current_user.role in ("coordinator", "doctor"):
        query = query.where(Donor.hospital_id == current_user.hospital_id)
    if organ:
        query = query.where(Donor.organ == organ)
    if status_filter:
        query = query.where(Donor.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    query = query.offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(query)).scalars().all()
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[DonorOut.model_validate(d) for d in items],
    )


async def get_donor(db: AsyncSession, donor_code: str) -> Donor:
    result = await db.execute(select(Donor).where(Donor.donor_code == donor_code))
    donor = result.scalar_one_or_none()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    return donor


async def update_donor(
    db: AsyncSession, donor_code: str, body: DonorUpdate, current_user: AppUser
) -> Donor:
    donor = await get_donor(db, donor_code)
    if body.status is not None:
        donor.status = body.status
    if body.test_results is not None:
        donor.test_results = body.test_results

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action="donor.updated",
        payload={"donor_code": donor_code, "changes": body.model_dump(exclude_none=True)},
    )
    await db.commit()
    await db.refresh(donor)
    return donor
