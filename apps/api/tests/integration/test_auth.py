"""Integration tests for auth routes."""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.db.session import get_db, Base
from app.models.models import AppUser
from app.core.security import hash_password

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
async def admin_user(db_session: AsyncSession):
    user = AppUser(
        email="admin@test.com",
        hashed_password=hash_password("AdminPass1!"),
        role="admin",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.mark.anyio
async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.anyio
async def test_login_invalid_credentials(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@fake.com", "password": "WrongPass!"},
    )
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_login_success_no_mfa(client: AsyncClient, admin_user: AppUser):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass1!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data or "mfa_pending_token" in data
