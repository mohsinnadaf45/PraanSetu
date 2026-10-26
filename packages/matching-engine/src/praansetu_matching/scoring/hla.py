"""HLA match scorer."""
from __future__ import annotations

from typing import Any

from praansetu_matching.models import DonorInput, RecipientInput


def _antigen_matches(donor_antigens: list, recipient_antigens: list) -> int:
    """Count how many antigens in a locus match."""
    return sum(1 for a in donor_antigens if a in recipient_antigens)


def hla_score(donor: DonorInput, recipient: RecipientInput) -> float:
    """
    Calculate HLA match score.
    Up to 6 antigen matches possible (2 A, 2 B, 2 DR).
    Returns 0.0–1.0 normalized score.
    """
    donor_hla = donor.test_results.get("hla", {})
    recipient_hla = recipient.hla

    if not donor_hla or not recipient_hla:
        return 0.0  # No HLA data → cannot score, but don't exclude

    total_matches = 0
    possible = 0

    for locus in ("a", "b", "dr"):
        d_antigens = donor_hla.get(locus, [])
        r_antigens = recipient_hla.get(locus, [])
        if d_antigens and r_antigens:
            matches = _antigen_matches(d_antigens, r_antigens)
            total_matches += matches
            possible += 2  # Max 2 per locus

    if possible == 0:
        return 0.0

    return total_matches / possible
