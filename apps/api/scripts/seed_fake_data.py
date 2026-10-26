"""Seed fake data for development and testing.
Usage: python scripts/seed_fake_data.py
"""
from __future__ import annotations

import asyncio
import random
from datetime import datetime, timedelta, timezone

from faker import Faker

fake = Faker("en_IN")

ORGANS = ["kidney", "liver", "heart", "lung", "pancreas"]
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
URGENCY_LEVELS = [1, 2, 3, 4, 5]


async def seed():
    from app.db.session import AsyncSessionLocal
    from app.models.models import Hospital, AppUser, Donor, Recipient, RuleVersion
    from app.core.security import hash_password
    from app.core.codes import generate_donor_code, generate_recipient_code
    import hashlib

    async with AsyncSessionLocal() as db:
        # Create hospitals
        hospitals = []
        for _ in range(3):
            h = Hospital(
                name=f"{fake.city()} Medical Institute",
                region=fake.state(),
                verified=True,
            )
            db.add(h)
            hospitals.append(h)
        await db.flush()
        print(f"Created {len(hospitals)} hospitals.")

        # Create users (one per role per hospital)
        roles = ["coordinator", "doctor", "committee", "auditor"]
        for hospital in hospitals:
            for role in roles:
                user = AppUser(
                    hospital_id=hospital.id,
                    email=f"{role}.{fake.user_name()}@fake.praansetu.in",
                    hashed_password=hash_password("FakePassw0rd!"),
                    role=role,
                    is_active=True,
                )
                db.add(user)
        await db.flush()
        print("Created users.")

        # Create a kidney rule version
        yaml_content = "# kidney v1 rules\nweights:\n  urgency: 0.4\n  hla: 0.3\n  waiting_time: 0.2\n  distance: 0.1\n"
        yaml_hash = hashlib.sha256(yaml_content.encode()).hexdigest()
        rv = RuleVersion(
            organ="kidney",
            version_tag="v1",
            weights_yaml_hash=yaml_hash,
            effective_from=datetime.now(timezone.utc) - timedelta(days=30),
        )
        db.add(rv)
        await db.flush()
        print("Created kidney rule version v1.")

        # Create donors
        for i in range(10):
            code = generate_donor_code()
            d = Donor(
                donor_code=code,
                hospital_id=random.choice(hospitals).id,
                organ=random.choice(ORGANS),
                blood_group=random.choice(BLOOD_GROUPS),
                size_kg=round(random.uniform(4, 6), 1),
                age_years=random.randint(18, 65),
                test_results={
                    "crossmatch": random.choice(["negative", "positive"]),
                    "pra_percent": random.randint(0, 80),
                },
                status="available",
            )
            db.add(d)
        await db.flush()
        print("Created 10 donors.")

        # Create recipients
        for i in range(30):
            code = generate_recipient_code()
            r = Recipient(
                recipient_code=code,
                hospital_id=random.choice(hospitals).id,
                organ=random.choice(ORGANS),
                blood_group=random.choice(BLOOD_GROUPS),
                size_kg=round(random.uniform(4, 6), 1),
                age_years=random.randint(5, 70),
                hla={
                    "a": [random.randint(1, 80), random.randint(1, 80)],
                    "b": [random.randint(1, 80), random.randint(1, 80)],
                    "dr": [random.randint(1, 18), random.randint(1, 18)],
                },
                urgency=random.choice(URGENCY_LEVELS),
                listed_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 500)),
                status="waiting",
            )
            db.add(r)
        await db.flush()
        print("Created 30 recipients.")

        await db.commit()
        print("✅ Seed complete.")


if __name__ == "__main__":
    import sys
    import os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    asyncio.run(seed())
