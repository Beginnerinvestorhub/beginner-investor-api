# Deployment Guide: GitHub to Render

## Overview
This guide covers deploying your Beginner Investor Hub application with the following architecture:
- **Frontend**: Vercel (Next.js)
- **Backend APIs**: Render (Node.js services)
- **Authentication**: Firebase Auth
- **Cache**: Redis.com
- **Database**: Render PostgreSQL

## Prerequisites

### Environment Variables Setup
Create these environment variables in Render dashboard:

#### Backend API Service
```bash
NODE_ENV=production
PORT=10000
REDIS_URL=redis://your-redis-url-from-redis.com
DATABASE_URL=postgresql://user:pass@host:port/db
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

#### AI Microservice
```bash
NODE_ENV=production
PORT=10001
REDIS_URL=redis://your-redis-url-from-redis.com
OPENAI_API_KEY=your-openai-api-key
MODEL_API_ENDPOINT=https://api.openai.com/v1
```

#### Market Data Service
```bash
NODE_ENV=production
PORT=10002
REDIS_URL=redis://your-redis-url-from-redis.com
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
MARKET_DATA_API_KEY=your-market-data-key
```

# Deployment Guide: GitHub to Render

## Overview
This guide covers deploying your Beginner Investor Hub with a hierarchical microservices architecture:
- **Frontend**: Vercel (Next.js)
- **Backend Services**: Render (5 optimized services instead of 7)
- **Authentication**: Firebase Auth
- **Cache**: Redis.com
- **Database**: Render PostgreSQL

## Service Architecture

### **5 Core Services:**
1. **backend-api-service** (Port 10000) - API Gateway & Authentication
2. **market-data-ingestion-service** (Port 10003) - Data Foundation  
3. **ai-microservice-engine** (Port 10001) - Powers AI behavioral nudging
4. **python-risk-engine** (Port 10002) - Powers risk calculations
5. **portfolio-simulation-service** (Port 10004) - Uses both engines + market data

### **Tools Integration:**
- `ai-behavioral-nudge-tool` → **Embedded in** `ai-microservice-engine`
- `risk-calculation-engine-tool` → **Embedded in** `python-risk-engine`

## Prerequisites

### Environment Variables by Service

#### **backend-api-service** (Main API)
```bash
NODE_ENV=production
PORT=10000
REDIS_URL=redis://your-redis-url-from-redis.com
DATABASE_URL=postgresql://user:pass@host:port/db
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Internal Service URLs
AI_MICROSERVICE_URL=https://ai-microservice-engine.onrender.com
PORTFOLIO_SIMULATION_URL=https://portfolio-simulation-service.onrender.com
MARKET_DATA_URL=https://market-data-ingestion-service.onrender.com
```

#### **ai-microservice-engine** 
```bash
NODE_ENV=production
PORT=10001
REDIS_URL=redis://your-redis-url
OPENAI_API_KEY=your-openai-api-key
MODEL_API_ENDPOINT=https://api.openai.com/v1
BEHAVIORAL_NUDGE_ENABLED=true
```

#### **python-risk-engine**
```bash
FLASK_ENV=production
PORT=10002
REDIS_URL=redis://your-redis-url
RISK_CALCULATION_ENABLED=true
```

#### **market-data-ingestion-service**
```bash
NODE_ENV=production
PORT=10003
REDIS_URL=redis://your-redis-url
DATABASE_URL=postgresql://...
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
FINNHUB_API_KEY=your-finnhub-key
MARKET_DATA_API_KEY=your-market-data-key
```

#### **portfolio-simulation-service**
```bash
NODE_ENV=production
PORT=10004
REDIS_URL=redis://your-redis-url
DATABASE_URL=postgresql://...
PYTHON_RISK_ENGINE_URL=https://python-risk-engine.onrender.com
MARKET_DATA_URL=https://market-data-ingestion-service.onrender.com
```

### 4. Frontend Deployment (Vercel)
1. Connect Vercel to your GitHub repository
2. Set root directory to `frontend/`
3. Configure environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
   NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.onrender.com
   NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"..."}
   ```
4. Deploy

### 5. Database Migration
After deployment, run migrations:
```bash
# SSH into your Render service or use Render Shell
npm run migrate
# or
node migrate.js
```

## Health Checks and Monitoring

Add health check endpoints to your services:

```javascript
// In your main server file
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'backend-api',
    version: process.env.npm_package_version 
  });
});
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure properly for your Vercel domain
3. **Rate Limiting**: Implement for API endpoints
4. **HTTPS**: Render provides this automatically
5. **Database**: Use connection pooling

## Troubleshooting

### Common Issues:

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs in Render dashboard

#### Connection Issues
- Verify Redis URL format
- Check database connection string
- Ensure environment variables are set

#### CORS Errors
```javascript
// Configure CORS for your Vercel domain
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

## Monitoring Setup

For production monitoring, consider:
1. Render's built-in metrics
2. External monitoring (DataDog, New Relic)
3. Error tracking (Sentry)
4. Log aggregation

## Scaling Considerations

- **Horizontal Scaling**: Add more Render instances
- **Database**: Use connection pooling
- **Redis**: Consider Redis clustering for high load
- **CDN**: Use Vercel's edge network for frontend

## Cost Optimization

- Use Render's free tier for development
- Monitor usage and scale appropriately
- Consider Redis memory usage
- Optimize database queries