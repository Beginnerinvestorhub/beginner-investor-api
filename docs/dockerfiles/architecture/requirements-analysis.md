# Requirements Analysis & Containerization Improvements

## 📋 Service-Specific Requirements Files

### backend-api-service/requirements.txt (if using Python components)
```txt
# Core API framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
alembic==1.12.1

# Redis
redis==5.0.1

# Authentication
pyjwt==2.8.0
firebase-admin==6.2.0

# HTTP client
httpx==0.25.2
requests==2.31.0

# Validation
pydantic==2.5.0

# Environment
python-dotenv==1.0.0
```

### Python Services Common Requirements

**market-data-ingestion-service/requirements.txt**
```txt
# Core framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Data processing
pandas==2.1.3
numpy==1.25.2

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23

# Redis
redis==5.0.1

# API clients
requests==2.31.0
alpha-vantage==2.3.1
finnhub-python==2.4.20

# Async support
aiohttp==3.9.1
asyncio-mqtt==0.13.0

# Environment
python-dotenv==1.0.0

# Scheduling
apscheduler==3.10.4
```

**ai-microservice-engine/requirements.txt**
```txt
# Core framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# AI/ML
openai==1.3.7
langchain==0.0.340
transformers==4.35.2
torch==2.1.1

# Data processing
pandas==2.1.3
numpy==1.25.2

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
redis==5.0.1

# HTTP clients
httpx==0.25.2
requests==2.31.0

# Environment
python-dotenv==1.0.0
```

**python-risk-engine/requirements.txt**
```txt
# Core framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Numerical computing
numpy==1.25.2
pandas==2.1.3
scipy==1.11.4
scikit-learn==1.3.2

# Financial calculations
quantlib==1.32
pyfolio==0.9.2
empyrical==0.5.7

# Statistical analysis
statsmodels==0.14.0

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
redis==5.0.1

# Async processing
celery==5.3.4

# Environment
python-dotenv==1.0.0
```

**portfolio-simulation-service/requirements.txt**
```txt
# Core framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Numerical computing
numpy==1.25.2
pandas==2.1.3
scipy==1.11.4

# Financial modeling
pyportfolioopt==1.5.5
empyrical==0.5.7
quantlib==1.32

# Monte Carlo simulations
matplotlib==3.8.2
seaborn==0.13.0

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
redis==5.0.1

# HTTP clients
httpx==0.25.2

# Environment
python-dotenv==1.0.0

# Async processing
aiofiles==23.2.1
```

## 📦 Package.json for Node.js Service

**backend-api-service/package.json**
```json
{
  "name": "backend-api-service",
  "version": "1.0.0",
  "description": "Fintech API Gateway",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "redis": "^4.6.10",
    "pg": "^8.11.3",
    "firebase-admin": "^11.11.1",
    "axios": "^1.6.2",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "typescript": "^5.2.2",
    "tsx": "^4.6.0",
    "tsc-alias": "^1.8.8",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## 🛠️ Code Refactoring Recommendations

### 1. Health Check Endpoints
Each service needs a `/health` endpoint:

```python
# Python services (FastAPI)
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "market-data-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
```

```typescript
// Node.js service (Express)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'backend-api-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

### 2. Environment Variable Management
Create a config module for each service:

```python
# config.py (Python services)
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL")
    redis_url: str = os.getenv("REDIS_URL")
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"

settings = Settings()
```

```typescript
// config.ts (Node.js service)
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  firebaseConfig: process.env.FIREBASE_SERVICE_ACCOUNT,
};
```

### 3. Database Initialization Scripts
Create `init-scripts/init.sql`:

```sql
-- init-scripts/init.sql
-- Create databases and initial schema

CREATE DATABASE IF NOT EXISTS fintech_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_symbol_timestamp (symbol, timestamp)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
```

## 🔄 Service Communication Improvements

### 1. Service Discovery
Add service registry pattern:

```python
# service_registry.py
import httpx
from typing import Dict, Optional

class ServiceRegistry:
    def __init__(self):
        self.services: Dict[str, str] = {
            "market-data": os.getenv("MARKET_DATA_URL", "http://market-data:8001"),
            "ai-engine": os.getenv("AI_SERVICE_URL", "http://ai-engine:8002"),
            "risk-engine": os.getenv("RISK_ENGINE_URL", "http://risk-engine:8003"),
            "portfolio-simulation": os.getenv("PORTFOLIO_SERVICE_URL", "http://portfolio-simulation:8004")
        }
    
    async def call_service(self, service: str, endpoint: str, method: str = "GET", **kwargs):
        if service not in self.services:
            raise ValueError(f"Service {service} not found")
        
        url = f"{self.services[service]}{endpoint}"
        
        async with httpx.AsyncClient() as client:
            response = await client.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()

registry = ServiceRegistry()
```

### 2. Circuit Breaker Pattern
Implement resilience patterns:

```python
# circuit_breaker.py
import asyncio
from datetime import datetime, timedelta
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open" 
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED

    async def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e

    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def _should_attempt_reset(self):
        return (datetime.now() - self.last_failure_time).seconds >= self.timeout
```

## 🚨 Missing Components & Recommendations

### 1. Logging Configuration
Create centralized logging:

```python
# logging_config.py
import logging
import sys
from datetime import datetime

def setup_logging(service_name: str, log_level: str = "INFO"):
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=f'%(asctime)s - {service_name} - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(service_name)
```

### 2. API Versioning
Implement API versioning:

```python
# main.py (FastAPI)
from fastapi import FastAPI

app = FastAPI(
    title="Market Data Service",
    version="1.0.0",
    docs_url="/api/v1/docs"
)

@app.include_router(v1_router, prefix="/api/v1")
```

### 3. Rate Limiting
Add rate limiting to protect services:

```python
# rate_limiter.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/v1/data")
@limiter.limit("10/minute")
async def get_data(request: Request):
    return {"data": "example"}
```

## 🔧 Production Enhancements

### 1. Monitoring & Metrics
Add Prometheus metrics:

```python
# metrics.py
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_LATENCY.observe(time.time() - start_time)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 2. Database Migrations
Use Alembic for database migrations:

```bash
# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Initial tables"

# Apply migrations
alembic upgrade head
```

### 3. Testing Strategy
Add comprehensive tests:

```python
# test_market_data.py
import pytest
from httpx import AsyncClient
from app import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

This containerization strategy provides a robust, scalable, and maintainable microservices architecture that follows best practices for security, performance, and operational excellence.