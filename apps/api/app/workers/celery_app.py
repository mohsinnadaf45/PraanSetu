"""Celery application factory."""
from __future__ import annotations

from celery import Celery

from app.config import settings

celery_app = Celery(
    "praansetu",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.offer_timers",
        "app.workers.notifications",
        "app.workers.checkpoints",
        "app.workers.reports",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        # Checkpoint: every 6 hours
        "publish-checkpoint": {
            "task": "app.workers.checkpoints.publish_latest_checkpoint",
            "schedule": 21600,
        },
        # Nightly fairness report: 01:00 UTC
        "nightly-fairness-report": {
            "task": "app.workers.reports.run_nightly_report",
            "schedule": 86400,  # daily
            "options": {"expires": 3600},
        },
        # Check for expired offers: every 5 minutes
        "expire-offers": {
            "task": "app.workers.offer_timers.expire_pending_offers",
            "schedule": 300,
        },
    },
)
