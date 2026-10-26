"""Waiting time scorer: longer wait = higher score."""
from __future__ import annotations

from datetime import datetime, timezone

from praansetu_matching.models import RecipientInput

MAX_WAIT_DAYS = 3650  # 10 years cap for normalization


def waiting_time_score(recipient: RecipientInput) -> float:
    """
    Normalize waiting time to 0.0–1.0.
    A recipient waiting MAX_WAIT_DAYS or more gets score 1.0.
    """
    now = datetime.now(timezone.utc)
    listed = recipient.listed_at
    if listed.tzinfo is None:
        listed = listed.replace(tzinfo=timezone.utc)
    days_waited = (now - listed).days
    return min(days_waited / MAX_WAIT_DAYS, 1.0)
