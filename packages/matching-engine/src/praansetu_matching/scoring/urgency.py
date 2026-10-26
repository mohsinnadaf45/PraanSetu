"""Urgency scorer: higher urgency = higher score."""
from __future__ import annotations

from praansetu_matching.models import RecipientInput


def urgency_score(recipient: RecipientInput) -> float:
    """
    Normalize urgency (1–5) to a 0.0–1.0 score.
    Level 5 (critical) maps to 1.0; level 1 (low) maps to 0.0.
    """
    return (recipient.urgency - 1) / 4.0
