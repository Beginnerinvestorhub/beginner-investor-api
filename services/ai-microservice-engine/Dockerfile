# Multi-stage build for AI microservice
FROM python:3.11-slim-bookworm AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_NO_DEPS=1 \
    PIP_ONLY_BINARY=:all: \
    PIP_PREFER_BINARY=1

# Set work directory
WORKDIR /app

# Build stage
FROM base AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --user --no-warn-script-location -r requirements.txt

# Production stage
FROM base AS runner

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user and set up directory with proper permissions
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

# Copy installed packages from builder
COPY --from=builder --chown=app:app /root/.local /home/app/.local

# Set working directory to app user's home
WORKDIR /home/app/app

# Copy application code
COPY --chown=app:app . .

# Ensure PATH includes user packages
ENV PATH="/home/app/.local/bin:$PATH" \
    PYTHONPATH="/home/app/app"

# Switch to non-root user
USER app

# Expose port
EXPOSE 8002

# Health check with curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8002/health || exit 1

# Start the application with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002", "--no-access-log"]