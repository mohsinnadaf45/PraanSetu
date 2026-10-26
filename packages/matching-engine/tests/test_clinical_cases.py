"""Tests executing doctor-checked clinical test scenarios."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from praansetu_matching.engine import run_matching
from praansetu_matching.models import DonorInput, RecipientInput


def test_doctor_checked_clinical_cases():
    cases_path = Path(__file__).parent / "cases" / "kidney_clinical_cases.json"
    with open(cases_path, encoding="utf-8") as f:
        cases = json.load(f)

    for case in cases:
        d_data = case["donor"]
        donor = DonorInput(
            donor_code=d_data["donor_code"],
            organ=d_data["organ"],
            blood_group=d_data["blood_group"],
            size_kg=d_data.get("size_kg"),
            age_years=d_data.get("age_years"),
            hospital_lat=d_data.get("hospital_lat"),
            hospital_lon=d_data.get("hospital_lon"),
            test_results=d_data.get("test_results", {}),
        )

        now = datetime.now(timezone.utc)
        recipients = []
        for r_data in case["recipients"]:
            listed_at = now - timedelta(days=r_data.get("listed_days_ago", 100))
            recipients.append(
                RecipientInput(
                    recipient_code=r_data["recipient_code"],
                    organ=r_data["organ"],
                    blood_group=r_data["blood_group"],
                    size_kg=r_data.get("size_kg"),
                    age_years=r_data.get("age_years"),
                    urgency=r_data.get("urgency", 3),
                    listed_at=listed_at,
                    hospital_lat=r_data.get("hospital_lat"),
                    hospital_lon=r_data.get("hospital_lon"),
                    hla=r_data.get("hla", {}),
                )
            )

        match_res = run_matching(donor, recipients)

        if case.get("expected_all_excluded"):
            assert len(match_res.ranked) == 0, (
                f"Scenario '{case['scenario_name']}': expected 0 ranked candidates but got {len(match_res.ranked)}"
            )
        else:
            assert len(match_res.ranked) > 0, (
                f"Scenario '{case['scenario_name']}' returned no eligible candidates"
            )
            assert match_res.ranked[0].recipient_code == case["expected_top_recipient"], (
                f"Scenario '{case['scenario_name']}': expected top candidate {case['expected_top_recipient']} "
                f"but got {match_res.ranked[0].recipient_code}"
            )

        # Check excluded candidates
        excluded_expected = case.get("expected_excluded_recipients", [])
        eligible_codes = {r.recipient_code for r in match_res.ranked}
        for excluded in excluded_expected:
            assert excluded not in eligible_codes, (
                f"Scenario '{case['scenario_name']}': candidate {excluded} should have been filtered out"
            )
