## Description
Briefly describe the change and its clinical or technical purpose.

## Scope
- [ ] Matching engine rule or scoring change
- [ ] Database schema / migration
- [ ] API endpoint or authorization change
- [ ] Audit log or cryptographic integrity change
- [ ] Infrastructure / worker / deployment

## Checklist
- [ ] Unit tests added / updated and passing
- [ ] No patient identifiers (PII/PHI) exposed in logs or tests
- [ ] Cryptographic hash chain unbroken (if modifying audit logs)
- [ ] If changing matching weights, medical board review tag noted
- [ ] Passes `pytest` and linter checks
