"""Unit tests for anonymous code generator."""
from __future__ import annotations

import re

import pytest

from app.core.codes import generate_donor_code, generate_recipient_code, generate_actor_code


def test_donor_code_format():
    code = generate_donor_code()
    assert re.match(r"^D-[A-Z0-9]{6}$", code), f"Unexpected format: {code}"


def test_recipient_code_format():
    code = generate_recipient_code()
    assert re.match(r"^R-[A-Z0-9]{6}$", code), f"Unexpected format: {code}"


def test_codes_are_unique():
    codes = {generate_donor_code() for _ in range(100)}
    assert len(codes) > 95  # Should be near-100% unique


def test_actor_code_deterministic():
    a1 = generate_actor_code("doctor", "user-123")
    a2 = generate_actor_code("doctor", "user-123")
    assert a1 == a2


def test_actor_code_format():
    code = generate_actor_code("coordinator", "some-id")
    assert code.startswith("CO-")


def test_actor_code_different_roles():
    c1 = generate_actor_code("doctor", "id")
    c2 = generate_actor_code("admin", "id")
    assert c1 != c2
