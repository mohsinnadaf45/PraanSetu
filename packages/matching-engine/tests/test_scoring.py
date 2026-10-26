"""Tests for matching engine scoring functions."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from praansetu_matching.models import DonorInput, RecipientInput
from praansetu_matching.scoring.urgency import urgency_score
from praansetu_matching.scoring.hla import hla_score
from praansetu_matching.scoring.waiting_time import waiting_time_score
from praansetu_matching.scoring.distance import distance_score
from praansetu_matching.scoring.pediatric import pediatric_score


def make_recipient(**kwargs) -> RecipientInput:
    defaults = dict(
        recipient_code="R-TEST01",
        organ="kidney",
        blood_group="O+",
        urgency=1,
        listed_at=datetime.now(timezone.utc) - timedelta(days=100),
    )
    defaults.update(kwargs)
    return RecipientInput(**defaults)


def make_donor(**kwargs) -> DonorInput:
    defaults = dict(
        donor_code="D-TEST01",
        organ="kidney",
        blood_group="O-",
    )
    defaults.update(kwargs)
    return DonorInput(**defaults)


class TestUrgencyScore:
    def test_level_1_is_zero(self):
        r = make_recipient(urgency=1)
        assert urgency_score(r) == 0.0

    def test_level_5_is_one(self):
        r = make_recipient(urgency=5)
        assert urgency_score(r) == 1.0

    def test_level_3_is_half(self):
        r = make_recipient(urgency=3)
        assert abs(urgency_score(r) - 0.5) < 1e-9


class TestHLAScore:
    def test_perfect_match(self):
        donor = make_donor(test_results={"hla": {"a": [1, 2], "b": [7, 8], "dr": [3, 4]}})
        recipient = make_recipient(hla={"a": [1, 2], "b": [7, 8], "dr": [3, 4]})
        score = hla_score(donor, recipient)
        assert score == 1.0

    def test_no_match(self):
        donor = make_donor(test_results={"hla": {"a": [1, 2], "b": [7, 8], "dr": [3, 4]}})
        recipient = make_recipient(hla={"a": [99, 98], "b": [97, 96], "dr": [95, 94]})
        score = hla_score(donor, recipient)
        assert score == 0.0

    def test_no_hla_data_returns_zero(self):
        donor = make_donor()
        recipient = make_recipient()
        assert hla_score(donor, recipient) == 0.0


class TestWaitingTimeScore:
    def test_long_wait_approaches_one(self):
        r = make_recipient(listed_at=datetime.now(timezone.utc) - timedelta(days=3650))
        assert waiting_time_score(r) == 1.0

    def test_new_listing_near_zero(self):
        r = make_recipient(listed_at=datetime.now(timezone.utc) - timedelta(days=1))
        score = waiting_time_score(r)
        assert score < 0.01


class TestDistanceScore:
    def test_same_location_is_one(self):
        donor = make_donor(test_results={"lat": 19.0, "lon": 72.8})
        recipient = make_recipient(lat=19.0, lon=72.8)
        score = distance_score(donor, recipient)
        assert abs(score - 1.0) < 1e-6

    def test_no_coords_returns_neutral(self):
        donor = make_donor()
        recipient = make_recipient()
        assert distance_score(donor, recipient) == 0.5


class TestPediatricScore:
    def test_adult_is_zero(self):
        assert pediatric_score(35, 40) == 0.0

    def test_child_recipient_adult_donor(self):
        assert pediatric_score(10, 40) == 0.5

    def test_child_recipient_child_donor(self):
        assert pediatric_score(10, 12) == 1.0

    def test_none_age_is_zero(self):
        assert pediatric_score(None, 30) == 0.0
