"""AES-256 field-level encryption for vault data using Fernet (symmetric)
with optional AWS KMS envelope encryption."""
from __future__ import annotations

import base64
import os
from functools import lru_cache
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


@lru_cache(maxsize=1)
def _get_fernet() -> Fernet:
    """Return a Fernet cipher keyed from settings (or KMS-decrypted key)."""
    if settings.use_kms:
        key = _kms_decrypt_data_key()
    else:
        raw = settings.VAULT_ENCRYPTION_KEY or os.environ.get("VAULT_ENCRYPTION_KEY", "")
        if not raw:
            raise RuntimeError("VAULT_ENCRYPTION_KEY is not set and KMS is not configured")
        # Accept URL-safe base64 or raw string
        key = raw.encode() if isinstance(raw, str) else raw
    return Fernet(key)


def _kms_decrypt_data_key() -> bytes:
    """Decrypt the data key using AWS KMS and return the plaintext key bytes."""
    import boto3  # type: ignore

    client = boto3.client("kms", region_name=settings.AWS_REGION)
    # The data key ciphertext is stored in VAULT_ENCRYPTION_KEY when using KMS
    ciphertext = base64.b64decode(settings.VAULT_ENCRYPTION_KEY)
    response = client.decrypt(
        CiphertextBlob=ciphertext,
        KeyId=settings.AWS_KMS_KEY_ARN,
    )
    plaintext: bytes = response["Plaintext"]
    # Fernet requires 32-byte URL-safe base64-encoded key
    return base64.urlsafe_b64encode(plaintext[:32])


def encrypt_field(value: str) -> str:
    """Encrypt a plaintext string field; return a base64-encoded ciphertext."""
    f = _get_fernet()
    return f.encrypt(value.encode("utf-8")).decode("ascii")


def decrypt_field(ciphertext: str) -> str:
    """Decrypt an encrypted field; returns the original plaintext string."""
    f = _get_fernet()
    try:
        return f.decrypt(ciphertext.encode("ascii")).decode("utf-8")
    except InvalidToken as e:
        raise ValueError("Decryption failed: invalid token or wrong key") from e


def encrypt_optional(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return encrypt_field(value)


def decrypt_optional(ciphertext: Optional[str]) -> Optional[str]:
    if ciphertext is None:
        return None
    return decrypt_field(ciphertext)
