# PraanSetu Infrastructure Monitoring & Uptime Checks

## 1. Monitored Endpoints & Targets

| Target | Probe Location | Frequency | Success Criteria | Alert Threshold | Escalation Contact |
|---|---|---|---|---|---|
| **API Health** (`/health`) | External synthetic ping (e.g. BetterStack / UptimeRobot) | 60 seconds | HTTP 200, `{"status": "ok"}` | 2 consecutive failures | Primary On-Call Engineer |
| **Main Postgres DB** | Internal healthcheck (`/health/ready`) | 60 seconds | Query latency < 250ms, pool active | 1 failure | Backend Tech Lead |
| **Identity Vault DB** | Internal healthcheck (`/health/ready`) | 60 seconds | Connection alive, pool active | 1 failure | Security Lead |
| **Redis Cache / Queue** | Worker heartbeat | 30 seconds | Ping pong response < 50ms | 2 failures | On-Call Engineer |
| **Celery Offer Worker** | Queue length & task lag | 60 seconds | Queue age < 120s | Offer expiry task lagged > 60s | On-Call Engineer + Ops |

## 2. Thresholds & Critical SLIs

- **Uptime Target:** 99.9% monthly availability for match execution and offer response APIs.
- **Offer Expiry Safety:** Celery countdown timer drift must not exceed 15 seconds.
- **Audit Hash Verifier:** Nightly audit chain verification runs at 02:00 UTC. Any broken chain raises immediate P0 security page.

## 3. Incident Channels & Alert Routing

- **P0 / P1 Alerts:** PagerDuty / Opsgenie phone escalation to active on-call engineer + WhatsApp alert bot.
- **P2 Warning Alerts:** `#alerts-dev` Slack / Discord webhook.
- **Phone Fallback:** If API is unreachable for >10 minutes during an active organ offer, the coordinator switches to manual phone dispatch runbook ([docs/runbooks/phone-fallback.md](file:///c:/Users/Shree/Documents/GitHub/PraanSetu/docs/runbooks/phone-fallback.md)).
