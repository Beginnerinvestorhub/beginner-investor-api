# syntax=docker/dockerfile:1.4

FROM python:3.12-slim-bullseye AS base
WORKDIR /app

# Environment setup
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg build-essential libffi-dev libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js + pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# -----------------------------
# Stage 1: Python dependencies
# -----------------------------
COPY pyproject.toml poetry.lock ./
RUN pip install --no-cache-dir poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# -----------------------------
# Stage 2: Node risk engine
# -----------------------------
COPY risk-engine/package.json risk-engine/pnpm-lock.yaml ./risk-engine/
WORKDIR /app/risk-engine
RUN pnpm install --frozen-lockfile \
    && pnpm run build  # if applicable

# -----------------------------
# Stage 3: Final setup
# -----------------------------
WORKDIR /app
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
