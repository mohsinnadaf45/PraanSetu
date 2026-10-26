"""Tests for matching engine hard filters."""
from __future__ import annotations

import pytest
from praansetu_matching.filters.blood_group import is_blood_group_compatible
from praansetu_matching.filters.crossmatch import passes_crossmatch
from praansetu_matching.filters.size import is_size_compatible


class TestBloodGroupFilter:
    def test_o_negative_universal_donor(self):
        for bg in ("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"):
            assert is_blood_group_compatible("O-", bg), f"O- should donate to {bg}"

    def test_ab_positive_can_only_donate_to_ab_positive(self):
        assert is_blood_group_compatible("AB+", "AB+")
        assert not is_blood_group_compatible("AB+", "A+")
        assert not is_blood_group_compatible("AB+", "O+")

    def test_a_positive_to_a_and_ab_positive(self):
        assert is_blood_group_compatible("A+", "A+")
        assert is_blood_group_compatible("A+", "AB+")
        assert not is_blood_group_compatible("A+", "B+")
        assert not is_blood_group_compatible("A+", "O+")

    def test_b_negative_compatibility(self):
        assert is_blood_group_compatible("B-", "B-")
        assert is_blood_group_compatible("B-", "B+")
        assert is_blood_group_compatible("B-", "AB-")
        assert is_blood_group_compatible("B-", "AB+")
        assert not is_blood_group_compatible("B-", "A+")


class TestCrossmatchFilter:
    def test_negative_passes(self):
        assert passes_crossmatch({"crossmatch": "negative"})

    def test_positive_fails(self):
        assert not passes_crossmatch({"crossmatch": "positive"})

    def test_missing_key_defaults_to_pass(self):
        assert passes_crossmatch({})

    def test_case_insensitive(self):
        assert not passes_crossmatch({"crossmatch": "Positive"})


class TestSizeFilter:
    def test_similar_sizes_pass(self):
        assert is_size_compatible(5.0, 5.0)
        assert is_size_compatible(5.0, 5.5)

    def test_too_large_fails(self):
        assert not is_size_compatible(10.0, 5.0)

    def test_none_size_passes(self):
        assert is_size_compatible(None, 5.0)
        assert is_size_compatible(5.0, None)
        assert is_size_compatible(None, None)

    def test_tolerance_boundary(self):
        # 30% tolerance: 10 and 7 differ by 30%
        assert is_size_compatible(10.0, 7.0)
        # 10 and 6.9 differ by 31%
        assert not is_size_compatible(10.0, 6.9)
