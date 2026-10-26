"""Celery tasks: publish audit log checkpoints to external store."""
from __future__ import annotations

import asyncio

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.workers.checkpoints.publish_latest_checkpoint")
def publish_latest_checkpoint():
    """Fetch the latest audit log hash and send to external checkpoint store."""
    asyncio.new_event_loop().run_until_complete(_publish())


async def _publish():
    from app.db.session import AsyncSessionLocal
    from app.models.models import AuditLog
    from app.audit.checkpoint import publish_checkpoint
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(AuditLog).order_by(AuditLog.time.desc()).limit(1)
        )
        latest = result.scalar_one_or_none()
        if not latest:
            logger.info("checkpoint_skip", reason="no audit entries yet")
            return
        ok = await publish_checkpoint(latest.entry_hash, latest.id)
        if ok:
            logger.info("checkpoint_done", entry_id=latest.id)
        else:
            logger.error("checkpoint_failed", entry_id=latest.id)
