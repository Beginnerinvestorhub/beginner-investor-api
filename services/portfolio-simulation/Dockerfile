# syntax=docker/dockerfile:1.4

# Use Python 3.11 Alpine image for smaller size
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    build-base \
    && rm -rf /var/cache/apk/*

# Copy requirements file
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src ./src/
COPY app.py ./

# Create non-root user
RUN addgroup --system portuser && adduser --system --ingroup portuser portuser

# Set ownership
RUN chown -R portuser:portuser /app

# Switch to non-root user
USER portuser

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:3004/health')" || exit 1

# Run the application
CMD ["python", "app.py"]
