"""Vault client: the only entry point for reading/writing identity data."""
from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vault_models import Identity
from app.schemas.schemas import IdentityOut, IdentityStore
from app.vault.encryption import decrypt_optional, encrypt_optional
from app.audit.writer import write_audit as _write_audit_sync


async def store_identity(vault_db: AsyncSession, body: IdentityStore) -> None:
    """Create or update an encrypted identity record in the vault."""
    result = await vault_db.execute(
        select(Identity).where(Identity.code == body.code)
    )
    identity = result.scalar_one_or_none()

    if identity:
        if body.name is not None:
            identity.name_enc = encrypt_optional(body.name)
        if body.phone is not None:
            identity.phone_enc = encrypt_optional(body.phone)
        if body.address is not None:
            identity.address_enc = encrypt_optional(body.address)
        if body.gov_id is not None:
            identity.gov_id_enc = encrypt_optional(body.gov_id)
    else:
        identity = Identity(
            code=body.code,
            name_enc=encrypt_optional(body.name),
            phone_enc=encrypt_optional(body.phone),
            address_enc=encrypt_optional(body.address),
            gov_id_enc=encrypt_optional(body.gov_id),
        )
        vault_db.add(identity)

    await vault_db.commit()


async def get_identity(
    vault_db: AsyncSession, code: str, current_user
) -> IdentityOut:
    """Return decrypted identity. Caller must have an approved reveal request."""
    from app.models.vault_models import IdentityReveal

    # Verify there's an approved reveal for this code by this user
    reveal_result = await vault_db.execute(
        select(IdentityReveal)
        .where(IdentityReveal.code == code)
        .where(IdentityReveal.status == "approved")
        .order_by(IdentityReveal.time.desc())
        .limit(1)
    )
    approved_reveal = reveal_result.scalar_one_or_none()
    if not approved_reveal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No approved reveal request found for this code.",
        )

    result = await vault_db.execute(select(Identity).where(Identity.code == code))
    identity = result.scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")

    return IdentityOut(
        code=code,
        name=decrypt_optional(identity.name_enc),
        phone=decrypt_optional(identity.phone_enc),
        address=decrypt_optional(identity.address_enc),
        gov_id=decrypt_optional(identity.gov_id_enc),
    )
