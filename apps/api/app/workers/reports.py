"""Celery tasks: nightly fairness and waiting-time reports."""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.workers.reports.run_nightly_report")
def run_nightly_report():
    asyncio.new_event_loop().run_until_complete(_run_report())


async def _run_report():
    from app.db.session import AsyncSessionLocal
    from app.services.report_service import fairness_report

    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        start = now - timedelta(days=1)
        report = await fairness_report(db, start, now)
        logger.info(
            "nightly_report",
            match_runs=report.total_match_runs,
            offers=report.total_offers,
            median_wait_days=report.median_waiting_days,
        )
        # In production, email/store the report
