"""Application configuration loaded from environment variables."""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────
    APP_ENV: Literal["local", "staging", "pilot", "production"] = "local"
    APP_HOST: str = "0.0.0.0"  # nosec B104
    APP_PORT: int = 8000
    DEBUG: bool = False

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: list[str] = ["api.praansetu.in", "*.onrender.com", "localhost", "127.0.0.1"]

    @field_validator("ALLOWED_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    # ── Security ─────────────────────────────────────────────
    SECRET_KEY: str = "insecure-dev-key-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 30

    # ── Main Database ────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://praansetu:praansetu_pass@localhost:5432/praansetu_main"
    DATABASE_URL_SYNC: str = "postgresql://praansetu:praansetu_pass@localhost:5432/praansetu_main"

    # ── Identity Vault Database ──────────────────────────────
    VAULT_DATABASE_URL: str = "postgresql+asyncpg://vault_user:vault_pass@localhost:5433/praansetu_vault"
    VAULT_DATABASE_URL_SYNC: str = "postgresql://vault_user:vault_pass@localhost:5433/praansetu_vault"

    # ── Redis / Celery ───────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # ── Encryption ───────────────────────────────────────────
    VAULT_ENCRYPTION_KEY: str = ""
    AWS_KMS_KEY_ARN: str = ""
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # ── Email ────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.example.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_ADDRESS: str = "noreply@praansetu.in"
    SMTP_USE_TLS: bool = True

    # ── SMS ──────────────────────────────────────────────────
    SMS_GATEWAY_PROVIDER: str = "sns"
    SMS_GATEWAY_API_KEY: str = ""
    SMS_GATEWAY_API_SECRET: str = ""
    SMS_FROM_NUMBER: str = ""

    # ── Audit Checkpoint ─────────────────────────────────────
    CHECKPOINT_STORE_URL: str = ""
    CHECKPOINT_STORE_TOKEN: str = ""

    # ── Matching Engine ──────────────────────────────────────
    RULES_DIR: str = "packages/matching-engine/rules"

    # ── Sentry ───────────────────────────────────────────────
    SENTRY_DSN: str = ""

    # ── Rate Limiting ────────────────────────────────────────
    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_AUTH: str = "10/minute"

    # ── Admin Bootstrap ──────────────────────────────────────
    BOOTSTRAP_ADMIN_EMAIL: str = "admin@praansetu.in"
    BOOTSTRAP_ADMIN_PASSWORD: str = "changeme"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def use_kms(self) -> bool:
        return bool(self.AWS_KMS_KEY_ARN)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
