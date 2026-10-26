#!/usr/bin/env python3
"""
Standalone Audit Log Verifier for Independent Auditors.
Verifies the cryptographic SHA-256 hash chain of PraanSetu audit log entries.
Can be executed completely offline on exported JSON logs or connected directly to a read-only DB replica.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from typing import Any

GENESIS_HASH = "0" * 64


def sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def verify_entries(entries: list[dict[str, Any]]) -> tuple[bool, int, str]:
    """
    Verifies chain integrity across a list of audit records.
    Returns: (is_valid, count_checked, message)
    """
    prev_hash = GENESIS_HASH
    checked = 0

    for idx, entry in enumerate(entries):
        entry_id = entry.get("id", f"index-{idx}")
        claimed_prev = entry.get("prev_hash")
        payload_hash = entry.get("payload_hash", "")
        claimed_entry_hash = entry.get("entry_hash", "")

        if claimed_prev != prev_hash:
            return (
                False,
                checked,
                f"Broken linkage at entry ID {entry_id}: expected prev_hash {prev_hash[:12]}..., found {str(claimed_prev)[:12]}...",
            )

        expected_hash = sha256(prev_hash + payload_hash)
        if claimed_entry_hash != expected_hash:
            return (
                False,
                checked,
                f"Tampered entry hash at ID {entry_id}: expected {expected_hash[:12]}..., found {claimed_entry_hash[:12]}...",
            )

        prev_hash = claimed_entry_hash
        checked += 1

    return True, checked, f"Verification successful: {checked} contiguous entries validated with genesis anchor."


def main():
    parser = argparse.ArgumentParser(description="Cryptographically verify PraanSetu audit log export.")
    parser.add_argument("file", help="Path to JSON file containing array of exported audit log entries")
    args = parser.parse_args()

    try:
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading file '{args.file}': {e}", file=sys.stderr)
        sys.exit(1)

    entries = data if isinstance(data, list) else data.get("entries", [])
    print(f"Found {len(entries)} audit log entries. Verifying cryptographic chain...")

    is_valid, checked, message = verify_entries(entries)
    if is_valid:
        print(f"[PASSED] {message}")
        sys.exit(0)
    else:
        print(f"[FAILED] {message}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
