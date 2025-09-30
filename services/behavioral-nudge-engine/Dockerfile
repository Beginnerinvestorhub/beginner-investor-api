# syntax=docker/dockerfile:1.4

# Use Python 3.10 slim-bullseye image with pinned digest for security
FROM python:3.10-slim-bullseye@sha256:f2ee145f3bc4e061f8dfe7e6ebd427023d6b32fa99260cdf5502a95ee239bd47

# Set working directory
WORKDIR /app

# Environment settings for clean behavior
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies with security updates
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends build-essential curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for runtime safety
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip check

# Copy project files
COPY . .

# Set ownership for non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8000

# Optional: Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
