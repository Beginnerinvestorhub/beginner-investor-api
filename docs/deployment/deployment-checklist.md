# Final Deployment Checklist & Troubleshooting Guide

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All services have proper `requirements.txt` or `package.json`
- [ ] Health check endpoints implemented (`/health`)
- [ ] Environment variable configuration completed
- [ ] Database initialization scripts created
- [ ] Logging configuration implemented
- [ ] Error handling and validation added
- [ ] API documentation generated
- [ ] Unit tests written and passing

### Docker Configuration
- [ ] `Dockerfile` created for each service
- [ ] `.dockerignore` files in place
- [ ] `docker-compose.yml` configured
- [ ] `docker-compose.dev.yml` for development
- [ ] `.env.template` provided
- [ ] Multi-stage builds optimized
- [ ] Non-root users configured
- [ ] Health checks defined

### Security
- [ ] API keys stored as environment variables
- [ ] Database credentials secured
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SSL/TLS certificates ready (production)

### Infrastructure
- [ ] Resource limits defined
- [ ] Volume mounts configured
- [ ] Network policies set
- [ ] Backup strategy planned
- [ ] Monitoring tools ready

## 🚀 Step-by-Step Deployment

### 1. Environment Setup
```bash
# Create project directory structure
mkdir fintech-microservices
cd fintech-microservices

# Copy all Docker files and configurations
# Set up environment variables
cp .env.template .env
# Edit .env with your actual values
```

### 2. Build and Test Locally
```bash
# Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Check logs
docker-compose logs -f

# Test all health endpoints
curl http://localhost:3000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

### 3. Production Deployment
```bash
# Production mode
docker-compose up -d

# Monitor startup
docker-compose ps
docker-compose logs -f
```

## 🐛 Common Issues & Solutions

### Issue 1: Service Won't Start
**Symptoms:**
- Container exits immediately
- Health checks failing
- Connection refused errors

**Solutions:**
```bash
# Check logs
docker-compose logs service-name

# Common fixes:
# 1. Missing environment variables
docker-compose exec service-name env | grep -i missing_var

# 2. Port conflicts
netstat -tlnp | grep :3000

# 3. Dependency issues
pip freeze | grep problematic-package

# 4. Rebuild without cache
docker-compose build --no-cache service-name
```

### Issue 2: Database Connection Problems
**Symptoms:**
- "Connection refused" errors
- Services can't connect to PostgreSQL
- Database health checks failing

**Solutions:**
```bash
# Check database status
docker-compose exec database pg_isready -U postgres

# Test connection manually
docker-compose exec backend-api curl database:5432

# Check environment variables
docker-compose exec service-name env | grep DATABASE

# Recreate database
docker-compose stop database
docker volume rm fintech_postgres_data
docker-compose up -d database
```

### Issue 3: Redis Connection Issues
**Symptoms:**
- Cache operations failing
- Session management broken
- Redis health checks failing

**Solutions:**
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Test connection
docker-compose exec backend-api redis-cli -h redis ping

# Clear Redis data
docker-compose exec redis redis-cli FLUSHALL

# Recreate Redis
docker-compose stop redis
docker volume rm fintech_redis_data
docker-compose up -d redis
```

### Issue 4: Service Communication Failures
**Symptoms:**
- Services can't reach each other
- Timeout errors between services
- Network connectivity issues

**Solutions:**
```bash
# Check network connectivity
docker-compose exec backend-api ping market-data
docker-compose exec backend-api nslookup market-data

# Check service URLs
docker-compose exec backend-api env | grep SERVICE_URL

# Test service endpoints
docker-compose exec backend-api curl http://market-data:8001/health

# Restart networking
docker-compose down
docker network prune
docker-compose up -d
```

### Issue 5: Memory/CPU Issues
**Symptoms:**
- Services crashing with OOM
- Slow response times
- High CPU usage

**Solutions:**
```bash
# Monitor resources
docker stats

# Adjust resource limits in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G

# Scale services if needed
docker-compose up -d --scale portfolio-simulation=2
```

### Issue 6: API Key/Authentication Problems
**Symptoms:**
- External API calls failing
- Authentication errors
- 401/403 responses

**Solutions:**
```bash
# Verify environment variables
docker-compose exec service-name env | grep API_KEY

# Test API keys manually
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check Firebase configuration
docker-compose exec backend-api python -c "import json; print(json.loads('$FIREBASE_SERVICE_ACCOUNT'))"
```

## 🔧 Advanced Troubleshooting

### Debug Mode Activation
```bash
# Enable debug logging
export LOG_LEVEL=debug
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Access container shell
docker-compose exec service-name bash
docker-compose exec service-name sh  # for Alpine images
```

### Performance Monitoring
```bash
# Container performance
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Service response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health

# Database performance
docker-compose exec database psql -U postgres -d fintech_db -c "SELECT * FROM pg_stat_activity;"
```

### Log Analysis
```bash
# Structured log analysis
docker-compose logs backend-api | grep ERROR
docker-compose logs --since 10m ai-engine | jq '.level'

# Log to file for analysis
docker-compose logs > deployment-logs.txt
```

## 📊 Monitoring Setup

### Basic Monitoring Script
```bash
#!/bin/bash
# monitor.sh
echo "🔍 Fintech Microservices Health Check"
echo "====================================="

services=("backend-api:3000" "market-data:8001" "ai-engine:8002" "risk-engine:8003" "portfolio-simulation:8004")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f -s http://localhost:$port/health > /dev/null; then
        echo "✅ $name - Healthy"
    else
        echo "❌ $name - Unhealthy"
    fi
done

echo ""
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Automated Health Checks
```bash
#!/bin/bash
# health-check.sh
for i in {1..30}; do
    if curl -f http://localhost:3000/health; then
        echo "✅ Backend API is healthy"
        break
    fi
    echo "⏳ Waiting for backend API... ($i/30)"
    sleep 10
done
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose exec database pg_dump -U postgres fintech_db > backup.sql

# Restore backup
docker-compose exec -T database psql -U postgres fintech_db < backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec database pg_dump -U postgres fintech_db > "backups/fintech_backup_$DATE.sql"
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v fintech_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .

# Restore volumes
docker run --rm -v fintech_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
```

## 📈 Scaling Considerations

### Horizontal Scaling
```bash
# Scale stateless services
docker-compose up -d --scale ai-engine=3
docker-compose up -d --scale portfolio-simulation=2

# Load balancer configuration (nginx example)
upstream backend {
    server backend-api:3000;
}
```

### Vertical Scaling
Adjust resource limits in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
    reservations:
      cpus