# Service Architecture - Beginner Investor Hub

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Vercel        │────▶│           Render Services            │
│   Frontend      │     │                                      │
│   (Next.js)     │     │  ┌─────────────────────────────────┐ │
└─────────────────┘     │  │     backend-api-service         │ │
                        │  │       (Port 10000)              │ │
┌─────────────────┐     │  │   • Firebase Auth Validation   │ │
│   Firebase      │────▶│  │   • Request Rate Limiting       │ │
│   Auth          │     │  │   • API Gateway & Routing       │ │
└─────────────────┘     │  └─────────────────┬───────────────┘ │
                        │                    │                 │
┌─────────────────┐     │  ┌─────────────────▼───────────────┐ │
│   Redis.com     │────▶│  │   market-data-ingestion-service │ │
│   • Caching     │     │  │       (Port 10003)              │ │
│   • Rate Limits │     │  │   • Redis: 1min cache TTL      │ │
│   • Session     │     │  │   • API Rate Limiting           │ │
└─────────────────┘     │  │   • Real-time Data Pipeline     │ │
                        │  └─────────────────┬───────────────┘ │
                        │                    │                 │
                        │  ┌─────────────────▼───────────────┐ │
                        │  │  ai-microservice-engine         │ │
                        │  │       (Port 10001)              │ │
                        │  │   • Redis: 1hr AI cache        │ │
                        │  │   • OpenAI Rate Limiting        │ │
                        │  │   • Firebase Token Verification │ │
                        │  │   • Behavioral Nudge Tool       │ │
                        │  └─────────────────┬───────────────┘ │
                        │                    │                 │
                        │  ┌─────────────────▼───────────────┐ │
                        │  │    python-risk-engine           │ │
                        │  │       (Port 10002)              │ │
                        │  │   • Redis: 30min risk cache    │ │
                        │  │   • Firebase Token Verification │ │
                        │  │   • Risk Calculation Tool       │ │
                        │  └─────────────────┬───────────────┘ │
                        │                    │                 │
                        │  ┌─────────────────▼───────────────┐ │
                        │  │  portfolio-simulation-service   │ │
                        │  │       (Port 10004)              │ │
                        │  │   • Redis: 10min sim cache     │ │
                        │  │   • Firebase User Verification  │ │
                        │  │   • Uses Risk + Market Data     │ │
                        │  └─────────────────────────────────┘ │
                        └──────────────────────────────────────┘
```

## Redis Caching Strategy

### **Cache Layers by Service:**

#### **Backend API Service**
```javascript
// User session cache
`session:${userId}` → TTL: 15 minutes
// API response cache  
`api:${endpoint}:${userId}` → TTL: 5 minutes
// Rate limiting
`rate_limit:${userId}` → TTL: 15 minutes (100 requests)
```

#### **Market Data Service**
```javascript
// Stock prices
`market:price:${symbol}` → TTL: 1 minute
// Market indicators
`market:indicators:${timeframe}` → TTL: 5 minutes  
// API rate limiting (external APIs)
`api_limit:alpha_vantage` → TTL: 1 minute (5 requests)
`api_limit:finnhub` → TTL: 1 second (60 requests)
```

#### **AI Microservice Engine**
```javascript
// AI responses (behavioral nudges)
`ai:response:${promptHash}:gpt-4` → TTL: 1 hour
// OpenAI rate limiting
`openai_limit:${userId}` → TTL: 1 hour (10 requests)
// User behavior patterns
`behavior:${userId}:patterns` → TTL: 24 hours
```

#### **Python Risk Engine**
```javascript
// Risk calculations
`risk:${portfolioHash}:${timeframe}` → TTL: 30 minutes
// Statistical models cache
`model:${modelType}:${parameters}` → TTL: 6 hours
// Correlation matrices
`correlation:${assets}:${period}` → TTL: 4 hours
```

#### **Portfolio Simulation Service**
```javascript
// Complete simulations
`simulation:${portfolioHash}:${params}` → TTL: 10 minutes
// Monte Carlo results
`monte_carlo:${portfolio}:${iterations}` → TTL: 30 minutes
// Backtest results
`backtest:${strategy}:${period}` → TTL: 2 hours
```

## Firebase Authentication Flow

### **Token Verification Process:**
```javascript
1. Frontend (Vercel) → Firebase Auth → ID Token
2. API Request with Bearer Token → Backend Service
3. Backend → Firebase Admin SDK → Token Verification
4. If valid → Cache user session in Redis → Proceed
5. If invalid → Return 401 Unauthorized
```

### **Service-to-Service Authentication:**
```javascript
// Internal service calls use shared secrets
headers: {
  'X-Internal-Auth': process.env.INTERNAL_SERVICE_SECRET,
  'X-User-Context': JSON.stringify(userInfo)
}
```

## Rate Limiting Strategy

### **User Rate Limits (Redis-based):**
```javascript
// General API usage
General: 100 requests / 15 minutes per user

// Expensive operations
AI Requests: 10 requests / hour per user
Portfolio Simulations: 20 requests / hour per user  
Risk Calculations: 50 requests / hour per user

// Market data
Market Data: 200 requests / 15 minutes per user
```

### **External API Rate Limits:**
```javascript
// Third-party API protection
Alpha Vantage: 5 requests / minute (shared)
Finnhub: 60 requests / second (shared)
OpenAI: Tier-based limiting by API key
```

## Data Flow with Caching

### **1. Portfolio Simulation Request:**
```
User Request → Backend API (auth + rate limit)
    ↓
Check Redis: `simulation:${portfolioHash}:${params}`
    ↓ (cache miss)
Call Portfolio Service → Check Redis: `risk:${portfolio}`  
    ↓ (cache miss)
Call Risk Engine → Calculate → Cache result (30min TTL)
    ↓
Call Market Data → Check Redis: `market:price:${symbols}`
    ↓ (cache hit/miss)
Return cached or fresh data (1min TTL)
    ↓
Portfolio Service → Run simulation → Cache (10min TTL)
    ↓
Return to user + cache API response (5min TTL)
```

### **2. AI Behavioral Nudge:**
```
User Request → Backend API (auth + rate limit: 10/hour)
    ↓
Call AI Service → Check Redis: `ai:response:${promptHash}`
    ↓ (cache miss)  
Call OpenAI API → Generate response → Cache (1hr TTL)
    ↓
Return nudge to user
```

## Performance Benefits

### **Cache Hit Rates (Expected):**
- Market Data: ~85% (frequent price checks)# Service Architecture - Beginner Investor Hub

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Vercel        │────▶│           Render Services            │
│   Frontend      │     │                                      │
│   (Next.js)     │     │  ┌─────────────────────────────────┐ │
└─────────────────┘     │  │     backend-api-service         │ │
                        │  │       (Port 10000)              │ │
┌─────────────────┐     │  │   • Main API Gateway            │ │
│   Firebase      │────▶│  │   • User Authentication        │ │
│   Auth          │     │  │   • Request Routing            │ │
└─────────────────┘     │  └─────────────────┬───────────────┘ │
                        │                    │                 │
┌─────────────────┐     │  ┌─────────────────▼───────────────┐ │
│   Redis.com     │────▶│  │   market-data-ingestion-service │ │
│   Cache         │     │  │       (Port 10003)              │ │
└─────────────────┘     │  │   • Market Data Source          │ │
                        │  │   • Real-time Data Updates      │ │
                        │  │   • Data Validation & Storage   │ │
                        │  └─────────────────┬───────────────┘ │
                        │                    │                 │
                        │  ┌─────────────────▼───────────────┐ │
                        │  │  ai-microservice-engine         │ │
                        │  │       (Port 10001)              │ │
                        │  │   • OpenAI Integration          │ │
                        │  │   • Powers: AI Behavioral       │ │
                        │  │     Nudge Tool                  │ │
                        │  └─────────────────┬───────────────┘ │
                        │                    │                 │
                        │  ┌─────────────────▼───────────────┐ │
                        │  │    python-risk-engine           │ │
                        │  │       (Port 10002)              │ │
                        │  │   • Risk Calculations           │ │
                        │  │   • Statistical Models          │ │
                        │  │   • Powers: Risk Calculation    │ │
                        │  │     for Portfolio Simulation    │ │
                        │  └─────────────────┬───────────────┘ │
                        │                    │                 │
                        │  ┌─────────────────▼───────────────┐ │
                        │  │  portfolio-simulation-service   │ │
                        │  │       (Port 10004)              │ │
                        │  │   • Uses Python Risk Engine     │ │
                        │  │   • Uses Market Data            │ │
                        │  │   • Portfolio Modeling          │ │
                        │  └─────────────────────────────────┘ │
                        └──────────────────────────────────────┘
```

## Data Flow Architecture

### 1. **Data Ingestion Layer**
```
External APIs → market-data-ingestion-service → Redis Cache → Database
    ↓
┌─ Alpha Vantage API
├─ Finnhub API  
└─ Other Market Data APIs
```

### 2. **Processing Engines**
```
AI Engine:
ai-microservice-engine → ai-behavioral-nudge (embedded functionality)
    ↓
OpenAI API → Behavioral Analysis → User Recommendations

Risk Engine:
python-risk-engine → risk-calculation (embedded functionality)
    ↓
NumPy/Pandas → Statistical Models → Risk Metrics
```

### 3. **Application Layer**
```
portfolio-simulation-service:
    ↓
├─ Calls python-risk-engine for risk calculations
├─ Fetches data from market-data-ingestion-service
└─ Generates portfolio simulations
```

### 4. **API Gateway**
```
backend-api-service:
    ↓
├─ Routes requests to appropriate services
├─ Handles authentication via Firebase
├─ Aggregates responses from multiple services
└─ Provides unified API to frontend
```

## Service Dependencies

### **Core Services (Always Running):**
1. **backend-api-service** - Main entry point
2. **market-data-ingestion-service** - Data foundation

### **Engine Services (On-Demand):**
3. **ai-microservice-engine** - Powers AI features
4. **python-risk-engine** - Powers risk calculations

### **Application Services:**
5. **portfolio-simulation-service** - Uses both engines

## Cost Optimization

**Estimated Monthly Cost (Render):**
- backend-api-service: $7-25/month
- market-data-ingestion: $7-25/month  
- ai-microservice-engine: $7-25/month
- python-risk-engine: $7-25/month
- portfolio-simulation: $7-25/month
- **Total: ~$35-125/month** (vs $175+ for 7 separate services)

## Scaling Strategy

### **Horizontal Scaling:**
- Scale engines independently based on load
- Market data service can be scaled for high-frequency updates
- Portfolio service scales with user simulations

### **Caching Strategy:**
- Market data cached in Redis (1-15 minute TTL)
- AI responses cached for similar queries
- Risk calculations cached for portfolio combinations

## Service Communication

```javascript
// Example: Portfolio service calling risk engine
const riskMetrics = await fetch(`${process.env.PYTHON_RISK_ENGINE_URL}/calculate-risk`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ portfolio, timeframe })
});

// Example: Backend API orchestrating multiple services
const portfolioData = await Promise.all([
  fetch(`${process.env.MARKET_DATA_URL}/latest-prices`),
  fetch(`${process.env.PORTFOLIO_SIMULATION_URL}/simulate`, { 
    method: 'POST', 
    body: JSON.stringify(userPortfolio) 
  }),
  fetch(`${process.env.AI_MICROSERVICE_URL}/behavioral-nudge`, {
    method: 'POST',
    body: JSON.stringify({ userProfile, currentPortfolio })
  })
]);
```