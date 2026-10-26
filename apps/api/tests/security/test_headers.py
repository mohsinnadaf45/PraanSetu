"""Security tests: rate limiting, CORS, header checks."""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_security_headers_present(client: AsyncClient):
    resp = await client.get("/health")
    assert "x-content-type-options" in resp.headers
    assert resp.headers["x-content-type-options"] == "nosniff"
    assert "x-frame-options" in resp.headers
    assert resp.headers["x-frame-options"] == "DENY"
