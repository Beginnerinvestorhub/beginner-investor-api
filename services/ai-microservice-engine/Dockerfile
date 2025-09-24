# Multi-stage build for AI microservice
FROM python:3.11-slim-bookworm AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random \
    PIP_DEFAULT_TIMEOUT=100

WORKDIR /app

# --- Builder stage ---
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# --- Production stage ---
FROM base AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user and home directory
RUN useradd --create-home --shell /bin/bash app

# Copy dependencies from builder
COPY --from=builder --chown=app:app /root/.local /home/app/.local

# Set up app directory
WORKDIR /home/app/app

# Copy application code
COPY --chown=app:app . .

# Set environment
ENV PATH="/home/app/.local/bin:$PATH" \
    PYTHONPATH="/home/app/app"

USER app

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8002/health || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002", "--no-access-log"]
