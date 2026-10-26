"""Anonymous code generator for donors and recipients."""
from __future__ import annotations

import secrets
import string

ALPHABET = string.ascii_uppercase + string.digits

DONOR_PREFIX = "D"
RECIPIENT_PREFIX = "R"
CODE_LENGTH = 7  # e.g. D-4F7A91X


def _random_segment(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def generate_donor_code() -> str:
    """Generate an anonymous donor code like D-4F7A91."""
    return f"{DONOR_PREFIX}-{_random_segment()}"


def generate_recipient_code() -> str:
    """Generate an anonymous recipient code like R-4F7A91."""
    return f"{RECIPIENT_PREFIX}-{_random_segment()}"


def generate_actor_code(role: str, user_id: str) -> str:
    """Stable actor code for audit logs derived from user id (not reversible)."""
    import hashlib
    digest = hashlib.sha256(f"{role}:{user_id}".encode()).hexdigest()[:8].upper()
    return f"{role[:2].upper()}-{digest}"
