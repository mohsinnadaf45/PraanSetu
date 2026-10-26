"""API package init - exposes all route modules."""
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

__all__ = [
    "routes_auth",
    "routes_donors",
    "routes_recipients",
    "routes_matches",
    "routes_offers",
    "routes_decisions",
    "routes_identity",
    "routes_audit",
    "routes_reports",
    "routes_admin",
]
