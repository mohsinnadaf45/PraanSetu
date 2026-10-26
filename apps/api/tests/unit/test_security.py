"""Unit tests for security helpers."""
from __future__ import annotations

import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    create_mfa_pending_token,
    generate_totp_secret,
    verify_totp,
)


def test_password_hash_and_verify():
    plain = "SuperSecret!123"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_password_wrong_hash_fails():
    assert not verify_password("test", "not-a-valid-argon2-hash")


def test_access_token_roundtrip():
    token = create_access_token(subject="user-abc", extra_claims={"role": "doctor"})
    payload = decode_token(token)
    assert payload["sub"] == "user-abc"
    assert payload["role"] == "doctor"
    assert payload["type"] == "access"


def test_mfa_pending_token_has_correct_type():
    token = create_mfa_pending_token("user-xyz")
    payload = decode_token(token)
    assert payload["type"] == "mfa_pending"
    assert payload["sub"] == "user-xyz"


def test_totp_verify():
    secret = generate_totp_secret()
    import pyotp
    totp = pyotp.TOTP(secret)
    current_code = totp.now()
    assert verify_totp(secret, current_code)
    assert not verify_totp(secret, "000000")
