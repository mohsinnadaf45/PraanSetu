#!/usr/bin/env python3
"""
Standalone Fake Data Generator for PraanSetu.
Generates realistic anonymous donor and recipient profiles with Indian geographic locations,
realistic blood group distributions, synthetic HLA typings, and sizes for matching simulations.
No real patient PII is ever used or stored.
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from datetime import datetime, timedelta, timezone

# Major transplant hospital locations in India (latitude, longitude, city, state)
HOSPITAL_LOCATIONS = [
    {"name": "AIIMS New Delhi", "city": "New Delhi", "lat": 28.5672, "lon": 77.2100},
    {"name": "KEM Hospital Mumbai", "city": "Mumbai", "lat": 19.0028, "lon": 72.8427},
    {"name": "Apollo Hospitals Chennai", "city": "Chennai", "lat": 13.0604, "lon": 80.2496},
    {"name": "PGIMER Chandigarh", "city": "Chandigarh", "lat": 30.7651, "lon": 76.7735},
    {"name": "Ruby Hall Clinic Pune", "city": "Pune", "lat": 18.5314, "lon": 73.8767},
    {"name": "Manipal Hospital Bengaluru", "city": "Bengaluru", "lat": 12.9584, "lon": 77.6489},
    {"name": "NIMS Hyderabad", "city": "Hyderabad", "lat": 17.4225, "lon": 78.4528},
    {"name": "Amrita Hospital Kochi", "city": "Kochi", "lat": 10.0328, "lon": 76.2941},
]

# Indian blood group distribution percentages (approx: O 37%, B 33%, A 22%, AB 8%)
BLOOD_GROUPS = ["O+", "O-", "B+", "B-", "A+", "A-", "AB+", "AB-"]
BLOOD_WEIGHTS = [0.35, 0.02, 0.31, 0.02, 0.20, 0.02, 0.07, 0.01]

COMMON_HLA_A = ["01", "02", "03", "11", "24", "33"]
COMMON_HLA_B = ["07", "08", "15", "35", "40", "44", "51"]
COMMON_HLA_DR = ["03", "04", "07", "11", "13", "15"]


def generate_hla() -> dict[str, list[str]]:
    return {
        "A": sorted(random.sample(COMMON_HLA_A, 2)),
        "B": sorted(random.sample(COMMON_HLA_B, 2)),
        "DR": sorted(random.sample(COMMON_HLA_DR, 2)),
    }


def generate_donor(index: int, organ: str = "kidney") -> dict:
    hosp = random.choice(HOSPITAL_LOCATIONS)
    age = random.randint(14, 68)
    # Pediatric weights vs adult weights
    size = round(random.uniform(35.0, 50.0) if age < 18 else random.uniform(50.0, 95.0), 1)
    blood_group = random.choices(BLOOD_GROUPS, weights=BLOOD_WEIGHTS)[0]

    return {
        "donor_code": f"D-SYNTH-{index:04d}",
        "organ": organ,
        "blood_group": blood_group,
        "size_kg": size,
        "age_years": age,
        "hospital_name": hosp["name"],
        "hospital_city": hosp["city"],
        "hospital_lat": hosp["lat"],
        "hospital_lon": hosp["lon"],
        "test_results": {
            "crossmatch": "negative",
            "hla": generate_hla(),
            "creatinine_mg_dl": round(random.uniform(0.7, 1.4), 2),
            "hbsag": "negative",
            "hcv": "negative",
            "hiv": "negative",
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def generate_recipient(index: int, organ: str = "kidney") -> dict:
    hosp = random.choice(HOSPITAL_LOCATIONS)
    age = random.choices([random.randint(5, 17), random.randint(18, 65)], weights=[0.12, 0.88])[0]
    size = round(random.uniform(25.0, 48.0) if age < 18 else random.uniform(48.0, 92.0), 1)
    blood_group = random.choices(BLOOD_GROUPS, weights=BLOOD_WEIGHTS)[0]
    days_waiting = random.randint(30, 1800)
    listed_at = datetime.now(timezone.utc) - timedelta(days=days_waiting)
    urgency = random.choices([1, 2, 3, 4, 5], weights=[0.10, 0.35, 0.35, 0.15, 0.05])[0]

    return {
        "recipient_code": f"R-SYNTH-{index:04d}",
        "organ": organ,
        "blood_group": blood_group,
        "size_kg": size,
        "age_years": age,
        "urgency": urgency,
        "listed_at": listed_at.isoformat(),
        "hospital_name": hosp["name"],
        "hospital_city": hosp["city"],
        "hospital_lat": hosp["lat"],
        "hospital_lon": hosp["lon"],
        "hla": generate_hla(),
        "crossmatch_positive": False,
    }


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic PraanSetu patient records.")
    parser.add_argument("--donors", type=int, default=10, help="Number of donors to generate")
    parser.add_argument("--recipients", type=int, default=50, help="Number of recipients to generate")
    parser.add_argument("--organ", type=str, default="kidney", choices=["kidney", "liver", "heart"])
    parser.add_argument("--output", type=str, default="", help="Path to write JSON output")
    args = parser.parse_args()

    data = {
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "note": "Pure synthetic test data - no real patient information.",
            "organ": args.organ,
            "donor_count": args.donors,
            "recipient_count": args.recipients,
        },
        "donors": [generate_donor(i + 1, args.organ) for i in range(args.donors)],
        "recipients": [generate_recipient(i + 1, args.organ) for i in range(args.recipients)],
    }

    output_str = json.dumps(data, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_str)
        print(f"Generated {args.donors} donors and {args.recipients} recipients -> {args.output}")
    else:
        print(output_str)


if __name__ == "__main__":
    main()
