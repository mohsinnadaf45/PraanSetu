"""Standalone audit chain verifier.
Usage: python scripts/verify_audit_chain.py
"""
from __future__ import annotations

import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


async def main():
    from app.db.session import AsyncSessionLocal
    from app.audit.chain import verify_chain

    print("Verifying audit chain...")
    async with AsyncSessionLocal() as db:
        result = await verify_chain(db)

    if result.valid:
        print(f"✅ Chain is VALID. {result.entries_checked} entries checked.")
    else:
        print(f"❌ Chain is INVALID! First bad entry: {result.first_bad_id}")
        print(f"   {result.message}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
