"""Audit checkpoint: publish the latest hash fingerprint to an external store."""
from __future__ import annotations

import httpx
import structlog

from app.config import settings

logger = structlog.get_logger()


async def publish_checkpoint(latest_hash: str, entry_id: str) -> bool:
    """
    Send the latest audit log hash to the configured external checkpoint store.
    Returns True on success, False on failure.
    """
    if not settings.CHECKPOINT_STORE_URL:
        logger.warning("checkpoint_skip", reason="CHECKPOINT_STORE_URL not configured")
        return False

    payload = {"entry_id": entry_id, "entry_hash": latest_hash}
    headers = {"Authorization": f"Bearer {settings.CHECKPOINT_STORE_TOKEN}"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                settings.CHECKPOINT_STORE_URL,
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            logger.info("checkpoint_published", entry_id=entry_id, hash_prefix=latest_hash[:12])
            return True
    except Exception as exc:
        logger.error("checkpoint_failed", error=str(exc))
        return False
