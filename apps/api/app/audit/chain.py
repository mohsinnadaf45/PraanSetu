"""Audit chain verifier: walks all entries and checks hashes."""
from __future__ import annotations

import hashlib
import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AuditLog
from app.schemas.schemas import AuditVerifyResponse

GENESIS_HASH = "0" * 64


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _canonical_payload_hash(payload_hash: str) -> str:
    """The stored payload_hash is already a sha256 hex digest."""
    return payload_hash


def _expected_entry_hash(prev_hash: str, payload_hash: str) -> str:
    return _sha256(prev_hash + payload_hash)


async def verify_chain(db: AsyncSession) -> AuditVerifyResponse:
    """Walk all audit entries in chronological order and verify each hash link."""
    result = await db.execute(select(AuditLog).order_by(AuditLog.time.asc()))
    entries = result.scalars().all()

    prev_hash = GENESIS_HASH
    checked = 0
    for entry in entries:
        expected = _expected_entry_hash(prev_hash, entry.payload_hash)
        if entry.entry_hash != expected or entry.prev_hash != prev_hash:
            return AuditVerifyResponse(
                valid=False,
                entries_checked=checked,
                first_bad_id=entry.id,
                message=f"Hash mismatch at entry {entry.id}. Chain is broken.",
            )
        prev_hash = entry.entry_hash
        checked += 1

    return AuditVerifyResponse(
        valid=True,
        entries_checked=checked,
        message=f"Chain verified: {checked} entries are intact.",
    )
