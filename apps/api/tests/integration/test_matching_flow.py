"""Integration test for the end-to-end allocation flow:
Donor & Recipient registration -> Run Matching -> Retrieve Ranked Results -> Create & Respond to Offer.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.db.session import get_db, Base
from app.models.models import AppUser, Hospital, RuleVersion, MatchRun
from app.core.security import hash_password, create_access_token
from app.services.offer_service import create_offers_for_match

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="function")
async def db_session():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_db():
        yield db_session

    app.dependency_overrides[get_db] = override_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def setup_hospital_and_doctor(db_session: AsyncSession):
    hospital = Hospital(name="AIIMS New Delhi", region="North", verified=True)
    db_session.add(hospital)
    await db_session.flush()

    doctor = AppUser(
        email="doctor@aiims.gov.in",
        hashed_password=hash_password("DoctorPass1!"),
        role="doctor",
        hospital_id=hospital.id,
        is_active=True,
    )
    db_session.add(doctor)

    rule_ver = RuleVersion(
        organ="kidney",
        version_tag="v1",
        weights_yaml_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        approved_by=doctor.id,
        effective_from=datetime.now(timezone.utc) - timedelta(days=1),
    )
    db_session.add(rule_ver)

    await db_session.commit()
    await db_session.refresh(doctor)
    return hospital, doctor


@pytest.mark.asyncio
async def test_full_allocation_flow(client: AsyncClient, setup_hospital_and_doctor, db_session: AsyncSession):
    hospital, doctor = setup_hospital_and_doctor
    token = create_access_token(
        subject=str(doctor.id),
        extra_claims={"email": doctor.email, "role": doctor.role, "hospital_id": hospital.id},
    )
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Register Donor
    donor_res = await client.post(
        "/donors",
        json={
            "organ": "kidney",
            "blood_group": "O+",
            "size_kg": 70.0,
            "age_years": 32,
            "test_results": {"crossmatch": "negative", "hla": {"A": ["01", "02"], "B": ["07", "08"], "DR": ["03", "04"]}},
        },
        headers=headers,
    )
    assert donor_res.status_code == 201
    donor_data = donor_res.json()
    donor_code = donor_data["donor_code"]
    assert donor_code.startswith("D-")

    # 2. Register Recipient
    recip_res = await client.post(
        "/recipients",
        json={
            "organ": "kidney",
            "blood_group": "O+",
            "size_kg": 68.0,
            "age_years": 35,
            "urgency": 4,
            "hla": {"A": ["01", "02"], "B": ["07", "08"], "DR": ["03", "04"]},
        },
        headers=headers,
    )
    assert recip_res.status_code == 201
    recip_data = recip_res.json()
    recip_code = recip_data["recipient_code"]
    assert recip_code.startswith("R-")

    # 3. Run Matching for Donor
    match_run_res = await client.post(
        "/matches/run",
        json={"donor_code": donor_code},
        headers=headers,
    )
    assert match_run_res.status_code == 201
    match_data = match_run_res.json()
    assert match_data["donor_code"] == donor_code
    ranked = match_data["result_json"]["ranked"]
    assert len(ranked) >= 1
    assert ranked[0]["recipient_code"] == recip_code

    # 4. Fetch Ranked Match by ID
    match_id = match_data["id"]
    get_match_res = await client.get(f"/matches/{match_id}", headers=headers)
    assert get_match_res.status_code == 200
    fetched_match = get_match_res.json()
    assert fetched_match["id"] == match_id
    assert len(fetched_match["result_json"]["ranked"]) >= 1

    # 5. Create Offers for Ranked Match
    match_obj = await db_session.get(MatchRun, match_id)
    offers = await create_offers_for_match(db_session, match_obj, doctor)
    await db_session.commit()
    assert len(offers) >= 1
    offer_id = offers[0].id

    # 6. List and Verify Offer
    offers_res = await client.get("/offers", headers=headers)
    assert offers_res.status_code == 200
    assert offers_res.json()["total"] >= 1

    # 7. Respond to Offer (Accept)
    respond_res = await client.post(
        f"/offers/{offer_id}/respond",
        json={"response": "accepted", "reason": "Recipient fit and consented."},
        headers=headers,
    )
    assert respond_res.status_code == 200
    assert respond_res.json()["status"] == "accepted"
