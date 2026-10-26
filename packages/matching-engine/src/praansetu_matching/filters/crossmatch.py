"""Crossmatch filter: positive crossmatch is an absolute exclusion."""
from __future__ import annotations

from typing import Any


def passes_crossmatch(donor_test_results: dict[str, Any]) -> bool:
    """
    Return True (passes) if crossmatch is negative or unknown.
    Return False (exclude) if crossmatch is positive.
    """
    crossmatch = donor_test_results.get("crossmatch", "negative")
    return str(crossmatch).lower() != "positive"
