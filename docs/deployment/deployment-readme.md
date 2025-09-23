# Fintech Microservices - Docker Deployment Guide

## 🏗️ Architecture Overview

This containerized deployment includes 5 microservices with supporting infrastructure:

### Core Services (Always Running)
- **backend-api-service**: API Gateway (Node.js) - Port 3000
- **market-data-ingestion-service**: Data ingestion (Python) - Port 8001

### Engine Services (On-Demand)
- **ai-microservice-engine**: AI/ML processing (Python) - Port 8002
- **python-risk-engine**: Risk calculations (Python) - Port 8003

### Application Services
- **portfolio-simulation-service**: Portfolio simulations (Python) - Port 8004

### Infrastructure
- **Redis**: Caching and session management - Port 6379
- **PostgreSQL**: Primary database - Port 5432

## 🚀 Quick Start

### Prerequisites
- Docker 24.0+ and Docker Compose 2.0+
- At least 4GB RAM available for Docker
- Required API keys (see Environment Configuration)

### 1. Clone and Setup
```bash
# Navigate to your project root
cd your-fintech-project

# Copy environment template
cp .env.template .env

# Edit .env with your actual values
nano .env  # or your preferred editor
```

### 2. Development Deployment
```bash
# Start all services for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### 3. Production Deployment
```bash
# Build and start production services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f backend-api

# Stop services
docker-compose down
```

## 🔧 Service Management

### Individual Service Operations
```bash
# Start specific service
docker-compose up -d backend-api

# Restart service
docker-compose restart ai-engine

# View service logs
docker-compose logs -f risk-engine

# Scale service (if supported)
docker-compose up -d --scale portfolio-simulation=2
```

### Health Monitoring
```bash
# Check all service health
docker-compose ps

# Check specific service health
docker inspect --format='{{.State.Health.Status}}' fintech_backend_api

# View health check logs
docker inspect fintech_backend_api | jq '.[0].State.Health'
```

## 🔐 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `secure_password_123` |
| `ALPHA_VANTAGE_API_KEY` | Market data API key | `ABC123XYZ` |
| `FINNHUB_API_KEY` | Financial data API key | `DEF456UVW` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | `{...}` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `AI_MODEL` | `gpt-4` | OpenAI model to use |
| `DATA_INGESTION_INTERVAL` | `300` | Data fetch interval (seconds) |
| `RISK_CALCULATION_WORKERS` | `4` | Risk engine worker processes |
| `SIMULATION_WORKERS` | `2` | Portfolio simulation workers |

## 🔍 Development Tools

When using `docker-compose.dev.yml`, additional tools are available:

- **Adminer** (Port 8080): Database management interface
- **Redis Commander** (Port 8081): Redis data visualization
- **Hot Reload**: All Python services support code hot-reloading
- **Debug Logging**: Enhanced logging for troubleshooting

### Development URLs
- Backend API: http://localhost:3000
- Market Data Service: http://localhost:8001
- AI Engine: http://localhost:8002
- Risk Engine: http://localhost:8003
- Portfolio Simulation: http://localhost:8004
- Database Admin: http://localhost:8080
- Redis Admin: http://localhost:8081

## 📊 Monitoring & Logging

### Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-api

# Follow logs with timestamps
docker-compose logs -f -t market-data

# Last 100 lines
docker-compose logs --tail=100 ai-engine
```

### Resource Monitoring
```bash
# Container resource usage
docker stats

# Service-specific stats
docker stats fintech_backend_api fintech_ai_engine
```

## 🛠️ Troubleshooting

### Common Issues

**Service Won't Start**
```bash
# Check service logs
docker-compose logs service-name

# Rebuild without cache
docker-compose build --no-cache service-name

# Remove and recreate
docker-compose rm service-name
docker-compose up -d service-name
```

**Database Connection Issues**
```bash
# Check database health
docker-compose exec database pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d database
```

**Memory Issues**
```bash
# Check resource usage
docker stats

# Adjust memory limits in docker-compose.yml
# Under deploy.resources.limits.memory
```

### Health Check Debugging
```bash
# Manual health check
curl http://localhost:3000/health
curl http://localhost:8001/health

# Container health status
docker inspect --format='{{.State.Health}}' container-name
```

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] API keys validated and working
- [ ] Database migrations completed
- [ ] SSL certificates configured (if applicable)
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented

### Production Commands
```bash
# Build all images
docker-compose build

# Start in production mode
docker-compose up -d

# View running services
docker-compose ps

# Update single service
docker-compose build service-name
docker-compose up -d --no-deps service-name
```

## 🔄 CI/CD Integration

### Docker Build Commands
```bash
# Build specific service
docker build -t fintech/backend-api:latest ./backend-api-service

# Build with specific target
docker build --target runner -t fintech/api:prod ./backend-api-service

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t fintech/api:latest .
```

### Deployment Scripts
Create deployment scripts for your CI/CD pipeline:

```bash
#!/bin/bash
# deploy.sh
set -e

echo "🚀 Deploying Fintech Microservices..."

# Pull latest images
docker-compose pull

# Build and deploy
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
docker-compose ps
echo "✅ Deployment complete!"
```

## 📋 Service Dependencies

### Startup Order
1. **Infrastructure**: Redis, PostgreSQL
2. **Core Services**: market-data-ingestion-service
3. **API Gateway**: backend-api-service
4. **Engines**: ai-microservice-engine, python-risk-engine
5. **Applications**: portfolio-simulation-service

### Service Communication
```
Frontend (Vercel) 
    ↓
backend-api-service (Port 3000)
    ↓
├─ market-data-ingestion-service (Port 8001)
├─ ai-microservice-engine (Port 8002)
├─ python-risk-engine (Port 8003)
└─ portfolio-simulation-service (Port 8004)
    ↓
Infrastructure (Redis, PostgreSQL)
```

## 🔧 Advanced Configuration

### Custom Networks
```yaml
# Add to docker-compose.yml for service isolation
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  database:
    driver: bridge
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect fintech_postgres_data

# Backup database
docker-compose exec database pg_dump -U postgres fintech_db > backup.sql

# Restore database
docker-compose exec -T database psql -U postgres fintech_db < backup.sql
```

### Service Scaling
```bash
# Scale specific services
docker-compose up -d --scale portfolio-simulation=3
docker-compose up -d --scale ai-engine=2

# Note: Only stateless services should be scaled
```

## 🔐 Security Best Practices

### Implemented Security Measures
- Non-root user execution in all containers
- Multi-stage builds to reduce attack surface
- Resource limits to prevent DoS
- Health checks for service monitoring
- Separate networks for service isolation

### Additional Recommendations
- Use Docker secrets for production
- Implement container scanning in CI/CD
- Regular image updates for security patches
- Network policies for traffic control
- Log aggregation and monitoring

## 📚 Additional Resources

### Required Files Checklist
- [ ] `backend-api-service/Dockerfile`
- [ ] `market-data-ingestion-service/Dockerfile`
- [ ] `ai-microservice-engine/Dockerfile`
- [ ] `python-risk-engine/Dockerfile`
- [ ] `portfolio-simulation-service/Dockerfile`
- [ ] `docker-compose.yml`
- [ ] `docker-compose.dev.yml`
- [ ] `.env` (from `.env.template`)
- [ ] `.dockerignore` files in each service directory

### Frontend Integration
Your React/Next.js frontend on Vercel should:
1. Point API calls to your backend-api-service URL
2. Use environment variables for API endpoints
3. Implement proper error handling for service unavailability
4. Consider API rate limiting and caching

### Example Frontend Environment Variables
```bash
# Vercel environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
```