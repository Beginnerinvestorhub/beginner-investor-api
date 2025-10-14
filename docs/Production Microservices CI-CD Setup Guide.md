\# Production Microservices CI/CD Setup Guide

\#\# 🏗️ System Architecture Overview

\`\`\`  
┌─────────────────────────────────────────────────────────────┐  
│                        GitHub Repository                     │  
│                         (Monorepo)                          │  
└────────────────┬────────────────────────────────────────────┘  
                 │  
                 ▼  
┌─────────────────────────────────────────────────────────────┐  
│              GitHub Actions CI/CD Pipeline                   │  
│  • Detect changed services                                  │  
│  • Run tests in parallel                                    │  
│  • Security scanning                                        │  
│  • Build Docker images                                      │  
│  • Push to Docker Hub                                       │  
└────────────────┬────────────────────────────────────────────┘  
                 │  
                 ▼  
┌─────────────────────────────────────────────────────────────┐  
│                       Docker Hub                             │  
│  • backend-api                                              │  
│  • python-risk-engine                                       │  
│  • portfolio-simulation                                     │  
│  • market-data-ingestion                                    │  
│  • ai-microservice-engine                                   │  
└────────────────┬────────────────────────────────────────────┘  
                 │  
                 ▼  
┌─────────────────────────────────────────────────────────────┐  
│                    Render Platform                           │  
│                                                              │  
│  ┌──────────────────────────────────────────────────────┐  │  
│  │           Production Environment                      │  │  
│  │                                                       │  │  
│  │  Backend API (3000) ◄─┐                             │  │  
│  │       │                │                              │  │  
│  │       ├──► Risk Engine (8000)                        │  │  
│  │       ├──► Portfolio Sim (8001)                      │  │  
│  │       ├──► Market Data (8002)                        │  │  
│  │       └──► AI Engine (8003)                          │  │  
│  │                                                       │  │  
│  │  PostgreSQL Database                                 │  │  
│  │  Redis Cache                                         │  │  
│  └──────────────────────────────────────────────────────┘  │  
│                                                              │  
│  ┌──────────────────────────────────────────────────────┐  │  
│  │           Staging Environment                         │  │  
│  │  (Same structure with develop branch images)         │  │  
│  └──────────────────────────────────────────────────────┘  │  
└─────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 📋 Prerequisites

\- GitHub account with repository access  
\- Docker Hub account  
\- Render account (sign up at render.com)  
\- Domain name (optional, for custom domains)  
\- Access to PostgreSQL client (for database setup)

\---

\#\# 🚀 Step 1: Repository Setup

\#\#\# 1.1 Create Monorepo Structure

\`\`\`bash  
mkdir fintech-platform && cd fintech-platform  
git init

\# Create service directories  
mkdir \-p services/{backend-api,python-risk-engine,portfolio-simulation,market-data-ingestion,ai-microservice-engine}  
mkdir \-p .github/workflows  
mkdir \-p infrastructure/scripts  
mkdir \-p shared/{proto,types,schemas}  
mkdir \-p docs  
\`\`\`

\#\#\# 1.2 Add Service Files

For each service directory, create:  
\- \`Dockerfile\` (use templates from artifacts)  
\- \`requirements.txt\` or \`package.json\`  
\- Application code in \`app/\` or \`src/\`  
\- Tests in \`tests/\`  
\- \`.dockerignore\`

\#\#\# 1.3 Initialize Git

\`\`\`bash  
git add .  
git commit \-m "Initial microservices setup"  
git branch develop  
git push \-u origin main  
git push \-u origin develop  
\`\`\`

\---

\#\# 🐳 Step 2: Docker Hub Setup

\#\#\# 2.1 Create Repositories

Create \*\*5 private repositories\*\* on Docker Hub:

1\. \`your-username/backend-api\`  
2\. \`your-username/python-risk-engine\`  
3\. \`your-username/portfolio-simulation\`  
4\. \`your-username/market-data-ingestion\`  
5\. \`your-username/ai-microservice-engine\`

\#\#\# 2.2 Generate Access Token

1\. Docker Hub → Account Settings → Security  
2\. New Access Token  
3\. Description: "GitHub Actions Microservices"  
4\. Permissions: \*\*Read, Write, Delete\*\*  
5\. Save token securely

\---

\#\# 🔐 Step 3: GitHub Secrets Configuration

Add these secrets in \*\*GitHub Repository → Settings → Secrets and variables → Actions\*\*:

\#\#\# Core Secrets  
\`\`\`  
DOCKER\_USERNAME=your\_dockerhub\_username  
DOCKER\_ACCESS\_TOKEN=\<generated\_token\>  
\`\`\`

\#\#\# Staging Deploy Hooks (get from Render after creating services)  
\`\`\`  
RENDER\_DEPLOY\_HOOK\_STAGING\_BACKEND\_API=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_STAGING\_RISK\_ENGINE=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_STAGING\_PORTFOLIO=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_STAGING\_MARKET\_DATA=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_STAGING\_AI\_ENGINE=https://api.render.com/deploy/...  
\`\`\`

\#\#\# Production Deploy Hooks  
\`\`\`  
RENDER\_DEPLOY\_HOOK\_PRODUCTION\_BACKEND\_API=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_PRODUCTION\_RISK\_ENGINE=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_PRODUCTION\_PORTFOLIO=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_PRODUCTION\_MARKET\_DATA=https://api.render.com/deploy/...  
RENDER\_DEPLOY\_HOOK\_PRODUCTION\_AI\_ENGINE=https://api.render.com/deploy/...  
\`\`\`

\---

\#\# ☁️ Step 4: Render Infrastructure Setup

\#\#\# 4.1 Create PostgreSQL Databases

\#\#\#\# Production Database  
1\. Render Dashboard → New → PostgreSQL  
2\. Name: \`postgresql-production\`  
3\. Database: \`fintech\_platform\_prod\`  
4\. Region: Oregon (or closest to users)  
5\. Plan: \*\*Standard\*\* ($50/month for production)  
6\. Create Database

\#\#\#\# Staging Database  
1\. Same steps with name \`postgresql-staging\`  
2\. Database: \`fintech\_platform\_staging\`  
3\. Plan: \*\*Starter\*\* ($7/month)

\*\*Save connection strings\*\* for environment variables.

\#\#\# 4.2 Create Redis Instances

\#\#\#\# Production Redis  
1\. New → Redis  
2\. Name: \`redis-production\`  
3\. Plan: \*\*Standard\*\* ($10/month)  
4\. Maxmemory Policy: \`allkeys-lru\`  
5\. Create Redis

\#\#\#\# Staging Redis  
1\. Same with \`redis-staging\`  
2\. Plan: \*\*Starter\*\* (Free)

\#\#\# 4.3 Create Web Services

For \*\*each microservice\*\*, create both staging and production instances:

\#\#\#\# Example: Backend API Production  
1\. New → Web Service  
2\. \*\*Deploy an existing image from a registry\*\*  
3\. Image URL: \`docker.io/your-username/backend-api:latest\`  
4\. Name: \`backend-api-production\`  
5\. Region: Oregon  
6\. Instance Type: \*\*Standard\*\* ($25/month)  
7\. Environment Variables:  
   \`\`\`  
   NODE\_ENV=production  
   PORT=3000  
   DATABASE\_URL=\[from PostgreSQL\]  
   REDIS\_URL=\[from Redis\]  
   RISK\_ENGINE\_URL=https://python-risk-engine-production.onrender.com  
   PORTFOLIO\_SERVICE\_URL=https://portfolio-simulation-production.onrender.com  
   MARKET\_DATA\_URL=https://market-data-ingestion-production.onrender.com  
   AI\_ENGINE\_URL=https://ai-microservice-engine-production.onrender.com  
   JWT\_SECRET=\[generate secure secret\]  
   LOG\_LEVEL=info  
   \`\`\`  
8\. Health Check Path: \`/health\`  
9\. Auto-Deploy: \*\*OFF\*\*  
10\. Create Web Service

\#\#\#\# Repeat for all 5 services × 2 environments \= 10 web services

\*\*Service Port Mapping:\*\*  
\- backend-api: 3000  
\- python-risk-engine: 8000  
\- portfolio-simulation: 8001  
\- market-data-ingestion: 8002  
\- ai-microservice-engine: 8003

\#\#\# 4.4 Get Deploy Hooks

For each service:  
1\. Service → Settings → Deploy Hook  
2\. Copy webhook URL  
3\. Add to GitHub Secrets (see Step 3\)

\---

\#\# 🔧 Step 5: Service Dependencies & Health Checks

\#\#\# 5.1 Health Check Endpoints

Each service MUST implement:

\*\*FastAPI (Python services):\*\*  
\`\`\`python  
from fastapi import FastAPI  
from datetime import datetime

app \= FastAPI()

@app.get("/health")  
async def health\_check():  
    return {  
        "status": "healthy",  
        "service": "python-risk-engine",  
        "timestamp": datetime.utcnow().isoformat(),  
        "version": "1.0.0"  
    }  
\`\`\`

\*\*Express (Node.js backend-api):\*\*  
\`\`\`javascript  
app.get('/health', (req, res) \=\> {  
  res.json({  
    status: 'healthy',  
    service: 'backend-api',  
    timestamp: new Date().toISOString(),  
    version: '1.0.0'  
  });  
});  
\`\`\`

\#\#\# 5.2 Service Communication

Services communicate via HTTP REST APIs. Example in backend-api:

\`\`\`javascript  
const axios \= require('axios');

async function calculateRisk(portfolioData) {  
  const response \= await axios.post(  
    \`${process.env.RISK\_ENGINE\_URL}/api/v1/calculate\`,  
    portfolioData,  
    { timeout: 30000 }  
  );  
  return response.data;  
}  
\`\`\`

\#\#\# 5.3 Database Schema Setup

Run migrations after PostgreSQL is created:

\`\`\`bash  
\# Install Render CLI  
npm install \-g render-cli

\# Login  
render login

\# Connect to production database  
render postgres connect postgresql-production

\# Run migrations  
\\i /path/to/schema.sql  
\`\`\`

\---

\#\# 🚢 Step 6: Deployment Workflow

\#\#\# 6.1 Deployment Order (Critical\!)

Services deploy in dependency order:

1\. \*\*Market Data Ingestion\*\* (no dependencies)  
2\. \*\*Python Risk Engine\*\* (depends on market data)  
3\. \*\*Portfolio Simulation\*\* (depends on risk engine)  
4\. \*\*AI Microservice Engine\*\* (standalone)  
5\. \*\*Backend API\*\* (depends on all services)

This order is \*\*already configured\*\* in the GitHub workflow.

\#\#\# 6.2 Deploy to Staging

\`\`\`bash  
\# Switch to develop branch  
git checkout develop

\# Make changes  
git add .  
git commit \-m "Add new feature"  
git push origin develop  
\`\`\`

GitHub Actions will:  
\- Detect changed services  
\- Run tests  
\- Build Docker images with \`:develop\` tag  
\- Push to Docker Hub  
\- Deploy to staging environment in order  
\- Run health checks

\#\#\# 6.3 Deploy to Production

\`\`\`bash  
\# Merge to main  
git checkout main  
git merge develop  
git push origin main

\# Or create release tag  
git tag \-a v1.0.0 \-m "Release 1.0.0"  
git push origin v1.0.0  
\`\`\`

Deploys with \`:latest\` tag to production.

\---

\#\# 📊 Step 7: Monitoring & Observability

\#\#\# 7.1 View Logs

\`\`\`bash  
\# Install Render CLI  
npm install \-g render-cli

\# View logs for a service  
render logs backend-api-production \--tail

\# View all services  
for service in backend-api python-risk-engine portfolio-simulation market-data-ingestion ai-microservice-engine; do  
  echo "=== $service \==="  
  render logs ${service}-production \--tail 50  
done  
\`\`\`

\#\#\# 7.2 Monitor Health

Create a monitoring script:

\`\`\`bash  
\#\!/bin/bash  
\# infrastructure/scripts/health-check.sh

services=(  
  "https://api.yourdomain.com/health"  
  "https://risk-engine.yourdomain.com/health"  
  "https://portfolio.yourdomain.com/health"  
  "https://market-data.yourdomain.com/health"  
  "https://ai-engine.yourdomain.com/health"  
)

for url in "${services\[@\]}"; do  
  status=$(curl \-s \-o /dev/null \-w "%{http\_code}" "$url")  
  if \[ "$status" \-eq 200 \]; then  
    echo "✅ $url \- OK"  
  else  
    echo "❌ $url \- FAILED ($status)"  
  fi  
done  
\`\`\`

\#\#\# 7.3 Set Up Alerts

Recommended monitoring tools:  
\- \*\*Render Metrics\*\*: Built-in CPU, memory, response times  
\- \*\*Sentry\*\*: Error tracking for all services  
\- \*\*Datadog/New Relic\*\*: APM and distributed tracing  
\- \*\*PagerDuty\*\*: On-call alerting

\---

\#\# 💰 Step 8: Cost Breakdown

\#\#\# Production Environment (Monthly)  
| Resource | Plan | Cost |  
|----------|------|------|  
| backend-api | Standard | $25 |  
| python-risk-engine | Standard | $25 |  
| portfolio-simulation | Standard | $25 |  
| market-data-ingestion | Standard | $25 |  
| ai-microservice-engine | Standard | $25 |  
| PostgreSQL | Standard | $50 |  
| Redis | Standard | $10 |  
| \*\*Total Production\*\* | | \*\*$185/month\*\* |

\#\#\# Staging Environment (Monthly)  
| Resource | Plan | Cost |  
|----------|------|------|  
| 5x Web Services | Starter | $35 |  
| PostgreSQL | Starter | $7 |  
| Redis | Starter | Free |  
| \*\*Total Staging\*\* | | \*\*$42/month\*\* |

\#\#\# Docker Hub  
\- Pro Plan (unlimited private repos): \*\*$5/month\*\*

\#\#\# Total Monthly Cost  
\- \*\*Production \+ Staging \+ Docker Hub\*\*: \~$232/month

\#\#\# Cost Optimization Tips  
1\. Use Starter instances for non-critical staging services  
2\. Scale down staging during off-hours (use Render's auto-suspend)  
3\. Share Redis between staging services  
4\. Use Docker layer caching (already configured)  
5\. Monitor and right-size instances based on actual usage

\---

\#\# 🔒 Step 9: Security Best Practices

\#\#\# 9.1 Environment Variables Security

\*\*Never commit secrets\!\*\* Use environment variables:

\`\`\`bash  
\# .env.example (commit this)  
NODE\_ENV=  
PORT=  
DATABASE\_URL=  
REDIS\_URL=  
JWT\_SECRET=  
API\_KEY=

\# .env (add to .gitignore)  
NODE\_ENV=production  
PORT=3000  
DATABASE\_URL=postgresql://...  
\`\`\`

\#\#\# 9.2 Database Security

1\. \*\*Enable SSL connections\*\*:  
   \`\`\`python  
   \# In Python services  
   engine \= create\_engine(  
       DATABASE\_URL,  
       connect\_args={"sslmode": "require"}  
   )  
   \`\`\`

2\. \*\*Use connection pooling\*\*:  
   \`\`\`javascript  
   // In Node.js  
   const pool \= new Pool({  
     connectionString: process.env.DATABASE\_URL,  
     max: 20,  
     idleTimeoutMillis: 30000,  
     ssl: { rejectUnauthorized: false }  
   });  
   \`\`\`

3\. \*\*Set up IP allowlists\*\* (if needed) in Render database settings

\#\#\# 9.3 API Security

Implement rate limiting in backend-api:

\`\`\`javascript  
const rateLimit \= require('express-rate-limit');

const limiter \= rateLimit({  
  windowMs: 15 \* 60 \* 1000, // 15 minutes  
  max: 100, // limit each IP to 100 requests per windowMs  
  message: 'Too many requests, please try again later.'  
});

app.use('/api/', limiter);  
\`\`\`

\#\#\# 9.4 Service-to-Service Authentication

Use API keys or JWT tokens for inter-service communication:

\`\`\`python  
\# In Python services  
from fastapi import Header, HTTPException

async def verify\_service\_token(x\_service\_token: str \= Header(...)):  
    if x\_service\_token \!= os.getenv("SERVICE\_API\_KEY"):  
        raise HTTPException(status\_code=401, detail="Invalid service token")  
    return True  
\`\`\`

\#\#\# 9.5 Security Scanning

The pipeline already includes Trivy scanning. Review results:  
1\. Go to GitHub → Security → Code scanning alerts  
2\. Review and fix vulnerabilities  
3\. Update dependencies regularly

\---

\#\# 🐛 Step 10: Troubleshooting Guide

\#\#\# Common Issues & Solutions

\#\#\#\# Issue: Service fails health check after deployment

\*\*Symptoms\*\*: Render shows "Deploy failed" or service is unhealthy

\*\*Solutions\*\*:  
1\. Check logs: \`render logs \<service-name\>\`  
2\. Verify environment variables are set correctly  
3\. Ensure \`/health\` endpoint exists and returns 200  
4\. Check if service is listening on correct PORT  
5\. Verify database connection string

\`\`\`bash  
\# Test health endpoint locally  
docker run \-p 8000:8000 \-e PORT=8000 your-username/python-risk-engine:latest  
curl http://localhost:8000/health  
\`\`\`

\#\#\#\# Issue: Build fails in GitHub Actions

\*\*Symptoms\*\*: Red X on commit, "Build failed"

\*\*Solutions\*\*:  
1\. Check GitHub Actions logs  
2\. Verify Dockerfile syntax  
3\. Ensure all dependencies in requirements.txt/package.json  
4\. Check if tests are passing locally:  
   \`\`\`bash  
   cd services/python-risk-engine  
   pytest  
   \`\`\`

\#\#\#\# Issue: Docker push to Hub fails

\*\*Symptoms\*\*: "unauthorized: authentication required"

\*\*Solutions\*\*:  
1\. Verify \`DOCKER\_ACCESS\_TOKEN\` is correct in GitHub Secrets  
2\. Check token hasn't expired  
3\. Ensure token has write permissions  
4\. Verify repository exists on Docker Hub

\#\#\#\# Issue: Service can't connect to database

\*\*Symptoms\*\*: "Connection refused" or "Authentication failed"

\*\*Solutions\*\*:  
1\. Verify \`DATABASE\_URL\` format:  
   \`\`\`  
   postgresql://username:password@host:port/database?sslmode=require  
   \`\`\`  
2\. Check database is running in Render  
3\. Verify connection pooling settings  
4\. Test connection manually:  
   \`\`\`bash  
   psql "$DATABASE\_URL"  
   \`\`\`

\#\#\#\# Issue: Inter-service communication fails

\*\*Symptoms\*\*: "Connection timeout" or "Network error"

\*\*Solutions\*\*:  
1\. Verify service URLs in environment variables  
2\. Check if dependent service is healthy  
3\. Ensure services are in same region (for lower latency)  
4\. Check timeout settings:  
   \`\`\`python  
   \# Increase timeout  
   response \= requests.post(url, json=data, timeout=60)  
   \`\`\`

\#\#\#\# Issue: High memory usage / OOM kills

\*\*Symptoms\*\*: Service restarts frequently, "Out of memory"

\*\*Solutions\*\*:  
1\. Monitor memory in Render dashboard  
2\. Optimize code (e.g., use generators, streaming)  
3\. Reduce worker count  
4\. Upgrade instance type  
5\. Implement pagination for large datasets

\---

\#\# 🔄 Step 11: Rolling Updates & Rollbacks

\#\#\# 11.1 Zero-Downtime Deployments

Render automatically does rolling updates:  
\- Starts new instance  
\- Waits for health check to pass  
\- Routes traffic to new instance  
\- Shuts down old instance

\*\*Ensure your health check is accurate\!\*\*

\#\#\# 11.2 Manual Rollback

If deployment fails:

\`\`\`bash  
\# Option 1: Redeploy previous image tag  
curl \-X POST "$RENDER\_DEPLOY\_HOOK\_PRODUCTION\_BACKEND\_API" \\  
  \-H "Content-Type: application/json" \\  
  \-d '{"image\_url": "docker.io/your-username/backend-api:v1.0.0"}'

\# Option 2: Revert Git commit and redeploy  
git revert HEAD  
git push origin main  
\`\`\`

\#\#\# 11.3 Automated Rollback (Advanced)

Add to workflow (after health checks):

\`\`\`yaml  
\- name: Rollback on failure  
  if: failure()  
  run: |  
    echo "Deployment failed, initiating rollback"  
    \# Get previous successful tag  
    PREVIOUS\_TAG=$(git describe \--tags \--abbrev=0 HEAD^)  
    curl \-X POST "${{ secrets.RENDER\_DEPLOY\_HOOK\_PRODUCTION\_BACKEND\_API }}" \\  
      \-H "Content-Type: application/json" \\  
      \-d "{\\"image\_url\\": \\"docker.io/${{ secrets.DOCKER\_USERNAME }}/backend-api:${PREVIOUS\_TAG}\\"}"  
\`\`\`

\---

\#\# 📈 Step 12: Scaling Strategies

\#\#\# 12.1 Horizontal Scaling

Render doesn't support multiple instances per service on Standard plan. For true horizontal scaling:

\*\*Option A: Upgrade to Pro Plan\*\*  
\- Multiple instances per service  
\- Load balancing included  
\- Auto-scaling based on CPU/memory

\*\*Option B: Use Multiple Services\*\*  
\- Create \`backend-api-1\`, \`backend-api-2\`  
\- Use external load balancer (Cloudflare, AWS ALB)

\#\#\# 12.2 Vertical Scaling

Upgrade instance types when needed:  
\- \*\*Starter\*\*: 0.5 GB RAM, 0.5 CPU  
\- \*\*Standard\*\*: 2 GB RAM, 1 CPU  
\- \*\*Pro\*\*: 4 GB RAM, 2 CPU  
\- \*\*Pro Plus\*\*: 8 GB RAM, 4 CPU

\#\#\# 12.3 Database Scaling

For high-traffic applications:  
1\. Enable read replicas (Standard+ plans)  
2\. Use connection pooling (already configured)  
3\. Implement caching with Redis  
4\. Consider database sharding for very large datasets

\#\#\# 12.4 Caching Strategy

Implement multi-level caching:

\`\`\`python  
\# In Python services  
from functools import lru\_cache  
import redis

redis\_client \= redis.from\_url(os.getenv("REDIS\_URL"))

@lru\_cache(maxsize=1000)  \# In-memory cache  
def get\_market\_data\_cached(symbol: str):  
    \# Check Redis first  
    cached \= redis\_client.get(f"market:{symbol}")  
    if cached:  
        return json.loads(cached)  
      
    \# Fetch from database  
    data \= fetch\_from\_db(symbol)  
      
    \# Cache for 5 minutes  
    redis\_client.setex(f"market:{symbol}", 300, json.dumps(data))  
    return data  
\`\`\`

\---

\#\# 🧪 Step 13: Testing Strategy

\#\#\# 13.1 Local Development

Use Docker Compose:

\`\`\`bash  
\# Start all services  
docker-compose up \-d

\# View logs  
docker-compose logs \-f backend-api

\# Run tests  
docker-compose exec python-risk-engine pytest

\# Stop all services  
docker-compose down  
\`\`\`

\#\#\# 13.2 Integration Tests

Create integration test suite:

\`\`\`python  
\# tests/integration/test\_risk\_calculation.py  
import requests  
import pytest

@pytest.fixture  
def api\_base\_url():  
    return "http://localhost:3000"

def test\_full\_risk\_calculation\_flow(api\_base\_url):  
    \# 1\. Create portfolio  
    portfolio \= {  
        "name": "Test Portfolio",  
        "positions": \[  
            {"symbol": "AAPL", "quantity": 100}  
        \]  
    }  
    response \= requests.post(f"{api\_base\_url}/api/v1/portfolios", json=portfolio)  
    assert response.status\_code \== 201  
    portfolio\_id \= response.json()\["id"\]  
      
    \# 2\. Calculate risk  
    response \= requests.post(  
        f"{api\_base\_url}/api/v1/portfolios/{portfolio\_id}/risk"  
    )  
    assert response.status\_code \== 200  
    assert "var" in response.json()  
    assert "sharpe\_ratio" in response.json()  
\`\`\`

\#\#\# 13.3 Load Testing

Use tools like k6 or Locust:

\`\`\`javascript  
// k6-load-test.js  
import http from 'k6/http';  
import { check, sleep } from 'k6';

export let options \= {  
  stages: \[  
    { duration: '2m', target: 100 }, // Ramp up  
    { duration: '5m', target: 100 }, // Stay at 100 users  
    { duration: '2m', target: 0 },   // Ramp down  
  \],  
};

export default function () {  
  let response \= http.get('https://api.yourdomain.com/health');  
  check(response, {  
    'status is 200': (r) \=\> r.status \=== 200,  
    'response time \< 500ms': (r) \=\> r.timings.duration \< 500,  
  });  
  sleep(1);  
}  
\`\`\`

Run with: \`k6 run k6-load-test.js\`

\---

\#\# 📚 Step 14: Documentation

\#\#\# 14.1 Create API Documentation

Use OpenAPI/Swagger:

\*\*FastAPI (automatic)\*\*:  
\`\`\`python  
from fastapi import FastAPI

app \= FastAPI(  
    title="Risk Engine API",  
    version="1.0.0",  
    description="Calculate portfolio risk metrics"  
)

\# Docs available at: /docs  
\`\`\`

\*\*Express with Swagger\*\*:  
\`\`\`javascript  
const swaggerJsdoc \= require('swagger-jsdoc');  
const swaggerUi \= require('swagger-ui-express');

const options \= {  
  definition: {  
    openapi: '3.0.0',  
    info: {  
      title: 'Backend API',  
      version: '1.0.0',  
    },  
  },  
  apis: \['./src/routes/\*.js'\],  
};

const specs \= swaggerJsdoc(options);  
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));  
\`\`\`

\#\#\# 14.2 Create Runbook

Document common operations in \`docs/RUNBOOK.md\`:

\`\`\`markdown  
\# Operations Runbook

\#\# Daily Tasks  
\- Check service health: \`make health-check\`  
\- Review error logs: \`make logs-errors\`

\#\# Deployment  
\- Staging: \`git push origin develop\`  
\- Production: \`git push origin main\`

\#\# Emergency Procedures  
\#\#\# Service Down  
1\. Check Render status page  
2\. View logs: \`render logs \<service\>-production\`  
3\. Check recent deployments  
4\. Rollback if needed

\#\#\# Database Issues  
1\. Check connection count  
2\. Review slow queries  
3\. Scale up if needed  
\`\`\`

\---

\#\# ✅ Step 15: Production Checklist

Before going live:

\#\#\# Infrastructure  
\- \[ \] All services deployed to production  
\- \[ \] Database backups enabled (automatic in Render)  
\- \[ \] Redis persistence configured  
\- \[ \] Health checks passing for all services  
\- \[ \] Environment variables set correctly  
\- \[ \] Custom domains configured (if applicable)  
\- \[ \] SSL certificates active

\#\#\# Security  
\- \[ \] All secrets rotated from defaults  
\- \[ \] API rate limiting enabled  
\- \[ \] CORS configured properly  
\- \[ \] Service-to-service auth implemented  
\- \[ \] Database SSL enabled  
\- \[ \] Security scanning passed  
\- \[ \] Dependabot enabled

\#\#\# Monitoring  
\- \[ \] Logging configured  
\- \[ \] Error tracking (Sentry) setup  
\- \[ \] Uptime monitoring (UptimeRobot)  
\- \[ \] APM tool integrated  
\- \[ \] Alerts configured for critical services  
\- \[ \] On-call rotation established

\#\#\# Documentation  
\- \[ \] API documentation published  
\- \[ \] Runbook created  
\- \[ \] Architecture diagrams updated  
\- \[ \] Environment setup documented  
\- \[ \] Deployment procedures documented

\#\#\# Testing  
\- \[ \] All tests passing  
\- \[ \] Load testing completed  
\- \[ \] Integration tests pass  
\- \[ \] Smoke tests for production

\#\#\# Compliance (if applicable)  
\- \[ \] GDPR compliance reviewed  
\- \[ \] Data retention policies set  
\- \[ \] Audit logging enabled  
\- \[ \] Backup/restore tested

\---

\#\# 🎯 Quick Reference Commands

\#\#\# Local Development  
\`\`\`bash  
\# Start all services  
docker-compose up \-d

\# View logs  
docker-compose logs \-f \<service-name\>

\# Rebuild service  
docker-compose up \-d \--build \<service-name\>

\# Stop all  
docker-compose down

\# Clean everything  
docker-compose down \-v  
\`\`\`

\#\#\# Deployment  
\`\`\`bash  
\# Deploy to staging  
git checkout develop  
git pull  
git push origin develop

\# Deploy to production  
git checkout main  
git merge develop  
git push origin main

\# Tag release  
git tag \-a v1.0.0 \-m "Release 1.0.0"  
git push origin v1.0.0  
\`\`\`

\#\#\# Monitoring  
\`\`\`bash  
\# View logs  
render logs backend-api-production \--tail

\# Check service status  
render ps

\# Restart service  
render restart backend-api-production

\# View metrics  
render metrics backend-api-production  
\`\`\`

\#\#\# Database  
\`\`\`bash  
\# Connect to production database  
render postgres connect postgresql-production

\# Run migration  
render postgres run postgresql-production \< migration.sql

\# Create backup  
render postgres backup postgresql-production  
\`\`\`

\---

\#\# 🆘 Support & Resources

\#\#\# Official Documentation  
\- \*\*GitHub Actions\*\*: https://docs.github.com/actions  
\- \*\*Docker\*\*: https://docs.docker.com  
\- \*\*Render\*\*: https://render.com/docs  
\- \*\*FastAPI\*\*: https://fastapi.tiangolo.com  
\- \*\*Express\*\*: https://expressjs.com

\#\#\# Community  
\- Render Community: https://community.render.com  
\- GitHub Discussions: Enable in your repository  
\- Stack Overflow: Tag questions appropriately

\#\#\# Emergency Contacts  
\- On-call engineer: \[Add contact\]  
\- DevOps lead: \[Add contact\]  
\- Emergency escalation: \[Add process\]

\---

\#\# 📊 Success Metrics

Track these KPIs:

\#\#\# Performance  
\- \*\*API Response Time\*\*: \< 200ms (p95)  
\- \*\*Error Rate\*\*: \< 0.1%  
\- \*\*Uptime\*\*: \> 99.9%

\#\#\# Deployment  
\- \*\*Deploy Frequency\*\*: Multiple times per day  
\- \*\*Lead Time\*\*: \< 1 hour (commit to production)  
\- \*\*MTTR\*\*: \< 15 minutes (mean time to recovery)  
\- \*\*Change Failure Rate\*\*: \< 5%

\#\#\# Cost  
\- \*\*Cost per Request\*\*: Track and optimize  
\- \*\*Resource Utilization\*\*: \> 70%  
\- \*\*Waste\*\*: Identify unused resources monthly

\---

\#\# 🎓 Next Steps

1\. \*\*Set up monitoring dashboard\*\* (Grafana/Datadog)  
2\. \*\*Implement distributed tracing\*\* (Jaeger/Zipkin)  
3\. \*\*Add feature flags\*\* (LaunchDarkly/Unleash)  
4\. \*\*Implement circuit breakers\*\* (for resilience)  
5\. \*\*Set up disaster recovery plan\*\*  
6\. \*\*Document incident response procedures\*\*  
7\. \*\*Conduct load testing\*\* (monthly)  
8\. \*\*Security audit\*\* (quarterly)

\---

\#\# 🏆 Best Practices Summary

1\. \*\*Never commit secrets\*\* \- Use environment variables  
2\. \*\*Test locally first\*\* \- Use Docker Compose  
3\. \*\*Deploy to staging\*\* \- Test before production  
4\. \*\*Monitor everything\*\* \- You can't fix what you can't see  
5\. \*\*Document as you go\*\* \- Future you will thank you  
6\. \*\*Automate repetitive tasks\*\* \- Use scripts and CI/CD  
7\. \*\*Keep dependencies updated\*\* \- Security and performance  
8\. \*\*Review logs regularly\*\* \- Catch issues early  
9\. \*\*Have a rollback plan\*\* \- Things will go wrong  
10\. \*\*Communicate changes\*\* \- Keep team informed

\---

\*\*Congratulations\!\*\* You now have a production-ready microservices CI/CD pipeline\! 🚀