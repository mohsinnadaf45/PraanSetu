"""Size compatibility filter (organ weight/size match)."""
from __future__ import annotations

from typing import Optional

# Maximum allowed size difference ratio (e.g. 0.25 means ±25%)
DEFAULT_SIZE_TOLERANCE = 0.30


def is_size_compatible(
    donor_size_kg: Optional[float],
    recipient_size_kg: Optional[float],
    tolerance: float = DEFAULT_SIZE_TOLERANCE,
) -> bool:
    """
    Return True if organ sizes are within the acceptable tolerance range.
    If either size is unknown, we default to compatible (cannot exclude).
    """
    if donor_size_kg is None or recipient_size_kg is None:
        return True  # Cannot exclude without data
    if donor_size_kg <= 0 or recipient_size_kg <= 0:
        return True

    ratio = abs(donor_size_kg - recipient_size_kg) / max(donor_size_kg, recipient_size_kg)
    return ratio <= tolerance
