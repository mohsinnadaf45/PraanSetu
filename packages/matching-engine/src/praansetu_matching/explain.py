"""Human-readable explanations of ranking decisions."""
from __future__ import annotations

from praansetu_matching.models import DonorInput, RankedCandidate, RecipientInput


def build_reasons(
    donor: DonorInput,
    recipient: RecipientInput,
    score_breakdown: dict[str, float],
    weights: dict[str, float],
    was_filtered: bool = False,
    filter_reason: str = "",
) -> list[str]:
    """
    Generate a plain-language list of reasons that explain a candidate's rank.
    """
    if was_filtered:
        return [f"Excluded: {filter_reason}"]

    reasons: list[str] = []

    urgency = score_breakdown.get("urgency", 0.0)
    if urgency >= 0.75:
        reasons.append(f"Urgency is very high (level {recipient.urgency}/5)")
    elif urgency >= 0.5:
        reasons.append(f"Urgency is high (level {recipient.urgency}/5)")
    elif urgency > 0:
        reasons.append(f"Urgency is moderate (level {recipient.urgency}/5)")

    hla = score_breakdown.get("hla", 0.0)
    if hla >= 0.8:
        reasons.append("Excellent HLA match (6/6 antigens)")
    elif hla >= 0.5:
        reasons.append(f"Good HLA match ({hla * 6:.0f}/6 antigens)")
    elif hla > 0:
        reasons.append(f"Partial HLA match ({hla * 6:.0f}/6 antigens)")
    else:
        reasons.append("No HLA data available")

    wt = score_breakdown.get("waiting_time", 0.0)
    if wt >= 0.5:
        reasons.append("Long waiting time increases priority")
    elif wt > 0:
        reasons.append("Moderate waiting time")

    dist = score_breakdown.get("distance", 0.0)
    if dist >= 0.8:
        reasons.append("Same city or very close hospital (faster procurement)")
    elif dist >= 0.5:
        reasons.append("Nearby hospital")

    ped = score_breakdown.get("pediatric", 0.0)
    if ped > 0:
        reasons.append("Pediatric priority applied")

    if not reasons:
        reasons.append("Ranked by overall combined score")

    return reasons
