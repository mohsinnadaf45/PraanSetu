# PraanSetu — Makefile shortcuts

.PHONY: dev test lint migrate seed docker-up docker-down clean

# ── Local development ─────────────────────────────────────────

dev:
	@echo "Starting API in dev mode..."
	cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

worker:
	@echo "Starting Celery worker..."
	cd apps/api && celery -A app.workers.celery_app worker --loglevel=info

beat:
	@echo "Starting Celery beat..."
	cd apps/api && celery -A app.workers.celery_app beat --loglevel=info

# ── Database ──────────────────────────────────────────────────

migrate:
	@echo "Running Alembic migrations..."
	cd apps/api && alembic upgrade head

migrate-down:
	cd apps/api && alembic downgrade -1

# ── Seed data ────────────────────────────────────────────────

seed:
	@echo "Seeding fake data..."
	cd apps/api && python scripts/seed_fake_data.py

verify-audit:
	cd apps/api && python scripts/verify_audit_chain.py

# ── Testing ───────────────────────────────────────────────────

test:
	@echo "Running matching engine tests..."
	cd packages/matching-engine && python -m pytest tests/ -v
	@echo "Running API unit tests..."
	cd apps/api && python -m pytest tests/unit/ -v

test-integration:
	cd apps/api && python -m pytest tests/integration/ -v

test-all:
	cd packages/matching-engine && python -m pytest tests/ -v --cov=src
	cd apps/api && python -m pytest tests/ -v --cov=app

# ── Lint / Type check ─────────────────────────────────────────

lint:
	cd apps/api && python -m ruff check app/ tests/
	cd packages/matching-engine && python -m ruff check src/ tests/ 2>/dev/null || true

typecheck:
	cd apps/api && python -m mypy app/ || true

security-scan:
	cd apps/api && python -m bandit -r app/ -ll
	cd apps/api && python -m pip_audit || true

# ── Install ───────────────────────────────────────────────────

install:
	cd packages/matching-engine && pip install -e .
	cd apps/api && pip install -e ".[dev]"

# ── Docker ───────────────────────────────────────────────────

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f api

# ── Clean ─────────────────────────────────────────────────────

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
