# syntax=docker/dockerfile:1.4

# Stage 1: Builder
FROM python:3.11-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    libffi-dev \
    curl \
    && rm -rf /var/cache/apk/*

# Install pip tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

WORKDIR /app

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    libpq \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup --system aiuser && adduser --system --ingroup aiuser aiuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy app code
COPY src ./src
COPY app.py ./
COPY config ./config
COPY prompts ./prompts

# Set ownership and permissions
RUN chown -R aiuser:aiuser /app

USER aiuser

EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:3003/health')" || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "3003"]
