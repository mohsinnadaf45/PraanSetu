# Standalone Audit Log Verifier

A lightweight, zero-dependency Python script designed for external regulatory bodies, independent medical ethicists, and hospital compliance officers to verify the mathematical tamper-evidence of PraanSetu allocation decisions.

## How the Hash Chain Works
Every allocation event (donor registration, match run, organ offer, decision) is hashed using SHA-256 and chained:

$$\text{EntryHash}_n = \text{SHA-256}(\text{EntryHash}_{n-1} + \text{PayloadHash}_n)$$

The genesis entry links to $64 \times \text{'0'}$. If any record in the past is inserted, modified, or reordered, all downstream hashes break.

## Usage

```bash
python tools/audit-verifier/verifier.py path/to/audit_export.json
```

Exit codes:
- `0`: Valid hash chain. No tampering detected.
- `2`: Chain integrity broken. Reports first corrupted record ID.
