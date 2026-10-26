"""Determinism tests: same input must always produce same output."""
from __future__ import annotations

import copy
from datetime import datetime, timedelta, timezone

import pytest
from praansetu_matching.engine import run_matching
from praansetu_matching.models import DonorInput, RecipientInput


def _make_test_input():
    donor = DonorInput(
        donor_code="D-DET001",
        organ="kidney",
        blood_group="O-",
        size_kg=5.0,
        age_years=30,
        test_results={"crossmatch": "negative", "hla": {"a": [1, 2], "b": [7, 8], "dr": [3, 4]}},
    )
    recipients = [
        RecipientInput(
            recipient_code=f"R-DET{i:03d}",
            organ="kidney",
            blood_group="A+",
            size_kg=5.0,
            age_years=25 + i,
            hla={"a": [1, i + 1], "b": [7, i + 2], "dr": [3, i + 3]},
            urgency=(i % 5) + 1,
            listed_at=datetime.now(timezone.utc) - timedelta(days=100 * i + 10),
        )
        for i in range(5)
    ]
    return donor, recipients


def test_deterministic_output():
    donor, recipients = _make_test_input()
    result1 = run_matching(donor, recipients)
    result2 = run_matching(donor, copy.deepcopy(recipients))
    assert result1.ranked == result2.ranked


def test_deterministic_order_across_runs():
    donor, recipients = _make_test_input()
    for _ in range(5):
        r = run_matching(donor, recipients)
        assert [c.recipient_code for c in r.ranked] == [
            c.recipient_code for c in run_matching(donor, recipients).ranked
        ]


def test_filter_excludes_wrong_organ():
    donor = DonorInput(
        donor_code="D-FILT01",
        organ="kidney",
        blood_group="O-",
        test_results={"crossmatch": "negative"},
    )
    recipients = [
        RecipientInput(
            recipient_code="R-HEART1",
            organ="heart",  # Wrong organ
            blood_group="O-",
            urgency=5,
            listed_at=datetime.now(timezone.utc),
        )
    ]
    result = run_matching(donor, recipients)
    assert len(result.ranked) == 0
    assert "R-HEART1" in result.filtered_out


def test_higher_urgency_ranks_first_when_other_scores_equal():
    now = datetime.now(timezone.utc)
    donor = DonorInput(
        donor_code="D-URG001",
        organ="kidney",
        blood_group="O-",
        size_kg=5.0,
        test_results={"crossmatch": "negative"},
    )
    low_urgency = RecipientInput(
        recipient_code="R-LOWURG",
        organ="kidney",
        blood_group="O+",
        size_kg=5.0,
        urgency=1,
        listed_at=now - timedelta(days=100),
    )
    high_urgency = RecipientInput(
        recipient_code="R-HIURG",
        organ="kidney",
        blood_group="O+",
        size_kg=5.0,
        urgency=5,
        listed_at=now - timedelta(days=100),
    )
    result = run_matching(donor, [low_urgency, high_urgency])
    assert result.ranked[0].recipient_code == "R-HIURG"
