"""Audit log writer: append hash-chained entries."""
from __future__ import annotations

import hashlib
import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AuditLog

GENESIS_HASH = "0" * 64  # Prev hash for the very first entry


def _canonical_payload(payload: dict[str, Any]) -> str:
    """Stable JSON representation for hashing (sorted keys, no whitespace)."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _payload_hash(payload: dict[str, Any]) -> str:
    return _sha256(_canonical_payload(payload))


def _entry_hash(prev_hash: str, payload_hash: str) -> str:
    return _sha256(prev_hash + payload_hash)


async def write_audit(
    db: AsyncSession,
    actor_code: str,
    action: str,
    payload: dict[str, Any],
    extra: dict[str, Any] | None = None,
) -> AuditLog:
    """
    Append a new audit log entry, chaining it to the previous one.
    Must be called inside an active transaction (before commit).
    """
    # Get the previous entry's hash
    prev_result = await db.execute(
        select(AuditLog).order_by(AuditLog.time.desc()).limit(1)
    )
    prev_entry = prev_result.scalar_one_or_none()
    prev_hash = prev_entry.entry_hash if prev_entry else GENESIS_HASH

    p_hash = _payload_hash(payload)
    e_hash = _entry_hash(prev_hash, p_hash)

    entry = AuditLog(
        actor_code=actor_code,
        action=action,
        payload_hash=p_hash,
        prev_hash=prev_hash,
        entry_hash=e_hash,
        extra=extra or {},
    )
    db.add(entry)
    await db.flush()  # assign id without committing
    return entry
