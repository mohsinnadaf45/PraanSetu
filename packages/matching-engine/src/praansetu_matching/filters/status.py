"""Status filter: only 'waiting' recipients and 'available' donors are eligible."""
from __future__ import annotations

from praansetu_matching.models import DonorInput, RecipientInput


def donor_is_available(donor: DonorInput) -> bool:
    """Donor must have status 'available'. (Engine doesn't carry status; callers enforce.)"""
    return True  # Filtered at service layer; kept here for auditability


def recipient_is_waiting(recipient: RecipientInput) -> bool:
    """
    The engine assumes all passed recipients are 'waiting'; this function
    documents the rule clearly so it can be unit-tested.
    """
    return True  # Filtered at service layer
