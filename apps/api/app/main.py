"""FastAPI application entry point."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import sentry_sdk
import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.core.errors import PraanSetuError, praansetu_exception_handler
from app.api import (
    routes_auth,
    routes_donors,
    routes_recipients,
    routes_matches,
    routes_offers,
    routes_decisions,
    routes_identity,
    routes_audit,
    routes_reports,
    routes_admin,
)

# ── Logging ──────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
)
logging.basicConfig(level=logging.WARNING if not settings.DEBUG else logging.DEBUG)
logger = structlog.get_logger()

# ── Sentry ───────────────────────────────────────────────────
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        traces_sample_rate=0.2,
    )

# ── Rate limiter ─────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])


# ── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", env=settings.APP_ENV)
    # Bootstrap admin user if needed
    await _bootstrap_admin()
    yield
    logger.info("shutdown")


async def _bootstrap_admin() -> None:
    """Create initial admin user if no users exist."""
    from app.db.session import AsyncSessionLocal
    from app.models.models import AppUser
    from app.core.security import hash_password
    from sqlalchemy import select, func

    async with AsyncSessionLocal() as db:
        count_result = await db.execute(select(func.count()).select_from(AppUser))
        count = count_result.scalar_one()
        if count == 0:
            admin = AppUser(
                email=settings.BOOTSTRAP_ADMIN_EMAIL,
                hashed_password=hash_password(settings.BOOTSTRAP_ADMIN_PASSWORD),
                role="admin",
                mfa_enabled=False,
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            logger.info("bootstrap_admin_created", email=settings.BOOTSTRAP_ADMIN_EMAIL)


# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="PraanSetu API",
    description="Organ allocation coordination platform API",
    version="0.1.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(PraanSetuError, praansetu_exception_handler)

# ── Middleware ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)

if settings.is_production:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ── Routers ───────────────────────────────────────────────────
API_PREFIX = "/api/v1"
ROUTERS = [
    routes_auth.router,
    routes_donors.router,
    routes_recipients.router,
    routes_matches.router,
    routes_offers.router,
    routes_decisions.router,
    routes_identity.router,
    routes_audit.router,
    routes_reports.router,
    routes_admin.router,
]

for r in ROUTERS:
    app.include_router(r, prefix=API_PREFIX)
    app.include_router(r)


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "env": settings.APP_ENV}
