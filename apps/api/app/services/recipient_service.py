"""Recipient service: business logic for recipient CRUD."""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.codes import generate_recipient_code, generate_actor_code
from app.models.models import Recipient, AppUser
from app.schemas.schemas import RecipientCreate, RecipientOut, RecipientUpdate, PaginatedResponse
from app.audit.writer import write_audit


async def create_recipient(
    db: AsyncSession, body: RecipientCreate, current_user: AppUser
) -> Recipient:
    code = generate_recipient_code()
    while (await db.execute(select(Recipient).where(Recipient.recipient_code == code))).scalar_one_or_none():
        code = generate_recipient_code()

    recipient = Recipient(
        recipient_code=code,
        hospital_id=current_user.hospital_id,
        organ=body.organ,
        blood_group=body.blood_group,
        size_kg=body.size_kg,
        age_years=body.age_years,
        hla=body.hla,
        urgency=body.urgency,
        status="waiting",
        registered_by=current_user.id,
    )
    db.add(recipient)
    await db.flush()

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action="recipient.created",
        payload={"recipient_code": code, "organ": body.organ},
    )
    await db.commit()
    await db.refresh(recipient)
    return recipient


async def list_recipients(
    db: AsyncSession,
    current_user: AppUser,
    page: int,
    page_size: int,
    organ: str | None,
    status_filter: str | None,
) -> PaginatedResponse:
    query = select(Recipient)
    if current_user.role in ("coordinator", "doctor"):
        query = query.where(Recipient.hospital_id == current_user.hospital_id)
    if organ:
        query = query.where(Recipient.organ == organ)
    if status_filter:
        query = query.where(Recipient.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    query = query.offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(query)).scalars().all()
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[RecipientOut.model_validate(r) for r in items],
    )


async def get_recipient(db: AsyncSession, recipient_code: str) -> Recipient:
    result = await db.execute(select(Recipient).where(Recipient.recipient_code == recipient_code))
    recipient = result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")
    return recipient


async def update_recipient(
    db: AsyncSession, recipient_code: str, body: RecipientUpdate, current_user: AppUser
) -> Recipient:
    recipient = await get_recipient(db, recipient_code)
    if body.status is not None:
        recipient.status = body.status
    if body.urgency is not None:
        recipient.urgency = body.urgency
    if body.hla is not None:
        recipient.hla = body.hla

    actor_code = generate_actor_code(current_user.role, current_user.id)
    await write_audit(
        db,
        actor_code=actor_code,
        action="recipient.updated",
        payload={"recipient_code": recipient_code, "changes": body.model_dump(exclude_none=True)},
    )
    await db.commit()
    await db.refresh(recipient)
    return recipient
