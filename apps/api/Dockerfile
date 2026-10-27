FROM python:3.12-slim

LABEL maintainer="praansetu@example.com"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy matching engine package first (local dependency)
COPY packages/matching-engine /packages/matching-engine

# Copy application code and dependencies
COPY apps/api /app

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -e /packages/matching-engine \
    && pip install --no-cache-dir -e /app

# Non-root user for security
RUN addgroup --gid 1001 praansetu && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 praansetu
USER praansetu

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import httpx, os; port = os.environ.get('PORT', '8000'); httpx.get(f'http://localhost:{port}/health').raise_for_status()"

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
