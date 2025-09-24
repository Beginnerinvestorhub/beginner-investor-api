
FROM python:3.10-slim AS builder

Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 

PYTHONUNBUFFERED=1 

PYTHONPATH=/app 

PIP_NO_CACHE_DIR=1 

PIP_DISABLE_PIP_VERSION_CHECK=1 

PIP_DEFAULT_TIMEOUT=100

Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends 

build-essential 

&& rm -rf /var/lib/apt/lists/*

Set work directory
WORKDIR /app

Copy only requirements first to leverage Docker cache
Updated path to correctly locate requirements.txt
COPY services/python-risk-engine/requirements.txt .

Install Python dependencies in a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

Install dependencies in a single RUN command to reduce layers
RUN pip install --upgrade pip && 

pip install --no-cache-dir -r requirements.txt

FROM python:3.10-slim

Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 

PYTHONUNBUFFERED=1 

PYTHONPATH=/app 

PATH="/opt/venv/bin:$PATH"

Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends 

libgomp1 

&& rm -rf /var/lib/apt/lists/*

Create non-root user
RUN groupadd -r appgroup && 

useradd -r -g appgroup -s /bin/false appuser && 

mkdir -p /app && 

chown -R appuser:appgroup /app

Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

Copy application code
Updated path to correctly copy the application code
COPY --chown=appuser:appgroup services/python-risk-engine/. /app

Switch to non-root user
USER appuser

Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 

CMD curl -f http://localhost:8000/health || exit 1

Expose the port the app runs on
EXPOSE 8000

Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]