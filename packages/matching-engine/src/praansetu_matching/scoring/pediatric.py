"""Pediatric priority scorer: children get a priority boost."""
from __future__ import annotations

from typing import Optional

PEDIATRIC_AGE_THRESHOLD = 18  # Years


def pediatric_score(
    recipient_age: Optional[int],
    donor_age: Optional[int],
) -> float:
    """
    Return 1.0 if recipient is a child (< 18) and donor is also a child.
    Return 0.5 if only the recipient is a child.
    Return 0.0 otherwise.
    Per NOTTO guidelines, pediatric donors should preferentially go to pediatric recipients.
    """
    if recipient_age is None:
        return 0.0
    if recipient_age < PEDIATRIC_AGE_THRESHOLD:
        if donor_age is not None and donor_age < PEDIATRIC_AGE_THRESHOLD:
            return 1.0  # Pediatric donor → pediatric recipient: top priority
        return 0.5  # Pediatric recipient with adult donor
    return 0.0
