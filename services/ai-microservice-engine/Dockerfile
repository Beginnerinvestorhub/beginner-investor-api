# syntax=docker/dockerfile:1.4

# Stage 1: Builder
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pip tools
RUN pip install --upgrade pip setuptools wheel

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system aiuser && adduser --system --ingroup aiuser aiuser

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy app code
COPY src ./src
COPY .env.example ./

# Set ownership and permissions
RUN chown -R aiuser:aiuser /app
USER aiuser

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
