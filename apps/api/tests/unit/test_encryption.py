"""Unit tests for vault encryption."""
from __future__ import annotations

import os
import pytest
from cryptography.fernet import Fernet


@pytest.fixture(autouse=True)
def set_env_key(monkeypatch):
    key = Fernet.generate_key().decode()
    monkeypatch.setenv("VAULT_ENCRYPTION_KEY", key)
    # Reset the lru_cache so it picks up the new key
    from app.vault import encryption
    encryption._get_fernet.cache_clear()
    yield
    encryption._get_fernet.cache_clear()


def test_encrypt_decrypt_roundtrip():
    from app.vault.encryption import encrypt_field, decrypt_field
    plaintext = "John Doe"
    ciphertext = encrypt_field(plaintext)
    assert ciphertext != plaintext
    recovered = decrypt_field(ciphertext)
    assert recovered == plaintext


def test_encrypt_optional_none():
    from app.vault.encryption import encrypt_optional, decrypt_optional
    assert encrypt_optional(None) is None
    assert decrypt_optional(None) is None


def test_different_plaintexts_give_different_ciphertexts():
    from app.vault.encryption import encrypt_field
    a = encrypt_field("Alice")
    b = encrypt_field("Bob")
    assert a != b


def test_decrypt_invalid_token_raises():
    from app.vault.encryption import decrypt_field
    with pytest.raises(ValueError):
        decrypt_field("not-a-valid-fernet-token")
