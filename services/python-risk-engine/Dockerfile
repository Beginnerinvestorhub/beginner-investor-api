# Multi-stage build for Python Risk Engine
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Build stage
FROM base AS builder
WORKDIR /app

# Install build dependencies for numerical and financial computing
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    gcc \
    g++ \
    gfortran \
    libblas-dev \
    liblapack-dev \
    libopenblas-dev \
    libhdf5-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# Production stage
FROM base AS runner
WORKDIR /app

# Install runtime dependencies for numerical computing
RUN apt-get update && apt-get install -y \
    curl \
    libopenblas0 \
    libgomp1 \
    libhdf5-103 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/app/.local

# Copy application code
COPY --chown=app:app . .

# Ensure PATH includes user packages
ENV PATH="/home/app/.local/bin:$PATH"

# Switch to non-root user
USER app

# Expose port
EXPOSE 8005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8005/health || exit 1

# Start the application
CMD ["python", "app.py"]