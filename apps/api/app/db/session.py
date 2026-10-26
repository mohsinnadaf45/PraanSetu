"""Database session factories."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# ── Main DB ──────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


# ── Vault DB ─────────────────────────────────────────────────
vault_engine = create_async_engine(
    settings.VAULT_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

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
