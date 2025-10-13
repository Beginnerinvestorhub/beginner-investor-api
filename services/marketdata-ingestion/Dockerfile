# syntax=docker/dockerfile:1.4

# Stage 1: Builder
FROM python:3.11-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-alpine AS runtime

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    libpq \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup --system market && adduser --system --ingroup market market

# Copy application code
COPY src ./src
COPY app.py ./

# Set ownership
RUN chown -R market:market /app

USER market

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:3002/health')" || exit 1

# Run the application
CMD ["python", "app.py"]
