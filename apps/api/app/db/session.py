"""Database session factories."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

def _create_engine(url: str, echo: bool, pool_size: int = 10, max_overflow: int = 20):
    is_sqlite = url.startswith("sqlite")
    kwargs = {"echo": echo}
    if not is_sqlite:
        kwargs["pool_pre_ping"] = True
        kwargs["pool_size"] = pool_size
        kwargs["max_overflow"] = max_overflow
    return create_async_engine(url, **kwargs)


# ── Main DB ──────────────────────────────────────────────────
engine = _create_engine(settings.DATABASE_URL, echo=settings.DEBUG, pool_size=10, max_overflow=20)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


# ── Vault DB ─────────────────────────────────────────────────
vault_engine = _create_engine(settings.VAULT_DATABASE_URL, echo=False, pool_size=5, max_overflow=10)

AsyncVaultSessionLocal = async_sessionmaker(
    bind=vault_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class VaultBase(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    async with AsyncSessionLocal() as session:
        yield session


async def get_vault_db() -> AsyncSession:  # type: ignore[misc]
    async with AsyncVaultSessionLocal() as session:
        yield session
