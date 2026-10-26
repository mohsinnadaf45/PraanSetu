FROM python:3.12-slim

LABEL maintainer="praansetu@example.com"
LABEL description="PraanSetu Backend API & Worker image for Render and Docker Compose"

WORKDIR /app

# Install system runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy packages and install matching-engine & shared-types
COPY packages/matching-engine /packages/matching-engine
COPY packages/shared-types /packages/shared-types
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -e /packages/matching-engine \
    && pip install --no-cache-dir -e /packages/shared-types

# Copy API configuration and dependencies
COPY apps/api/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir -e /app

# Copy application source code
COPY apps/api /app

# Run as non-root user
RUN addgroup --gid 1001 praansetu && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 praansetu
USER praansetu

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
