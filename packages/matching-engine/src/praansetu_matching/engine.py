"""Main matching engine: runs hard filters then weighted scoring."""
from __future__ import annotations

from praansetu_matching.explain import build_reasons
from praansetu_matching.filters.blood_group import is_blood_group_compatible
from praansetu_matching.filters.crossmatch import passes_crossmatch
from praansetu_matching.filters.size import is_size_compatible
from praansetu_matching.models import (
    DonorInput,
    MatchingResult,
    RankedCandidate,
    RecipientInput,
)
from praansetu_matching.rules_loader import load_weights
from praansetu_matching.scoring.distance import distance_score
from praansetu_matching.scoring.hla import hla_score
from praansetu_matching.scoring.pediatric import pediatric_score
from praansetu_matching.scoring.urgency import urgency_score
from praansetu_matching.scoring.waiting_time import waiting_time_score


def _apply_hard_filters(
    donor: DonorInput, recipients: list[RecipientInput]
) -> tuple[list[RecipientInput], dict[str, str]]:
    """
    Step 1: Hard filters.
    Returns (eligible recipients, {excluded_code: reason}).
    """
    eligible: list[RecipientInput] = []
    excluded: dict[str, str] = {}

    for r in recipients:
        # Organ must match
        if r.organ != donor.organ:
            excluded[r.recipient_code] = f"Organ mismatch ({r.organ} ≠ {donor.organ})"
            continue

        # Blood group compatibility
        if not is_blood_group_compatible(donor.blood_group, r.blood_group):
            excluded[r.recipient_code] = (
                f"Incompatible blood group "
                f"(donor={donor.blood_group}, recipient={r.blood_group})"
            )
            continue

        # Size compatibility
        if not is_size_compatible(donor.size_kg, r.size_kg):
            excluded[r.recipient_code] = (
                f"Size incompatible "
                f"(donor={donor.size_kg}kg, recipient={r.size_kg}kg)"
            )
            continue

        # Crossmatch
        if not passes_crossmatch(donor.test_results):
            excluded[r.recipient_code] = "Positive crossmatch"
            continue

        eligible.append(r)

    return eligible, excluded


def _score_candidate(
    donor: DonorInput,
    recipient: RecipientInput,
    weights: dict[str, float],
) -> tuple[float, dict[str, float]]:
    """
    Step 2: Weighted scoring.
    Returns (total_score, score_breakdown).
    """
    breakdown = {
        "urgency": urgency_score(recipient),
        "hla": hla_score(donor, recipient),
        "waiting_time": waiting_time_score(recipient),
        "distance": distance_score(donor, recipient),
        "pediatric": pediatric_score(recipient.age_years, donor.age_years),
    }
    total = sum(weights.get(k, 0.0) * v for k, v in breakdown.items())
    return round(total, 6), breakdown


def run_matching(
    donor: DonorInput,
    recipients: list[RecipientInput],
    rule_version_tag: str = "v1",
) -> MatchingResult:
    """
    Run matching for a donor against a list of recipients.
    Same input always produces the same output (deterministic).
    """
    organ = donor.organ
    weights = load_weights(organ, rule_version_tag)

    # Step 1: Hard filters
    eligible, filter_reasons = _apply_hard_filters(donor, recipients)

    # Step 2: Score eligible candidates
    scored: list[tuple[RecipientInput, float, dict[str, float]]] = []
    for r in eligible:
        score, breakdown = _score_candidate(donor, r, weights)
        scored.append((r, score, breakdown))

    # Sort descending by score, then ascending by waiting time for ties
    scored.sort(key=lambda x: (-x[1], -waiting_time_score(x[0])))

    ranked: list[RankedCandidate] = []
    for rank, (r, score, breakdown) in enumerate(scored, start=1):
        reasons = build_reasons(
            donor=donor,
            recipient=r,
            score_breakdown=breakdown,
            weights=weights,
        )
        ranked.append(
            RankedCandidate(
                rank=rank,
                recipient_code=r.recipient_code,
                score=score,
                reasons=reasons,
                score_breakdown=breakdown,
            )
        )

    return MatchingResult(
        donor_code=donor.donor_code,
        rule_version=rule_version_tag,
        ranked=ranked,
        filtered_out=list(filter_reasons.keys()),
        filter_reasons=filter_reasons,
    )
