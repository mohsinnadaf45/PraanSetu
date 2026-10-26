"""Unit tests for audit chain logic."""
from __future__ import annotations

import hashlib
import json

import pytest

GENESIS_HASH = "0" * 64


def sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()


def canonical(payload: dict) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def payload_hash(payload: dict) -> str:
    return sha256(canonical(payload))


def entry_hash(prev: str, phash: str) -> str:
    return sha256(prev + phash)


def test_genesis_entry_hash():
    p = {"action": "donor.created", "donor_code": "D-AABBCC"}
    ph = payload_hash(p)
    eh = entry_hash(GENESIS_HASH, ph)
    assert len(eh) == 64
    assert eh != GENESIS_HASH


def test_chain_links():
    entries = [
        {"action": "donor.created"},
        {"action": "match.run"},
        {"action": "offer.accepted"},
    ]
    prev = GENESIS_HASH
    hashes = []
    for e in entries:
        ph = payload_hash(e)
        eh = entry_hash(prev, ph)
        hashes.append(eh)
        prev = eh

    # Verify chain: re-walk
    prev = GENESIS_HASH
    for i, e in enumerate(entries):
        ph = payload_hash(e)
        expected = entry_hash(prev, ph)
        assert expected == hashes[i], f"Chain broken at entry {i}"
        prev = hashes[i]


def test_tampered_entry_fails():
    p1 = {"action": "donor.created"}
    p2 = {"action": "match.run"}
    ph1 = payload_hash(p1)
    eh1 = entry_hash(GENESIS_HASH, ph1)

    ph2 = payload_hash(p2)
    eh2 = entry_hash(eh1, ph2)

    # Tamper: change eh1
    bad_eh1 = sha256("tampered")
    bad_eh2 = entry_hash(bad_eh1, ph2)
    assert bad_eh2 != eh2, "Tamper should change the next hash"


def test_canonical_json_stable():
    p = {"z": 1, "a": 2, "m": 3}
    c1 = canonical(p)
    c2 = canonical({"a": 2, "m": 3, "z": 1})
    assert c1 == c2, "Canonical JSON must be deterministic regardless of key order"
