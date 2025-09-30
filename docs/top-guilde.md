using this as structure guide 
### 1. Data Ingestion Layer

External APIs → market-data-ingestion-service → Redis Cache → Database
    ↓
┌─ Alpha Vantage API
├─ Finnhub API  
└─ Other Market Data APIs

### 2. Processing Engines

AI Engine:
ai-microservice-engine → ai-behavioral-nudge (embedded functionality)
    ↓
OpenAI API → Behavioral Analysis → User Recommendations
Risk Engine:
python-risk-engine → risk-calculation (embedded functionality)
    ↓
NumPy/Pandas → Statistical Models → Risk Metrics

### 3. Application Layer

portfolio-simulation-service:
    ↓
├─ Calls python-risk-engine for risk calculations
├─ Fetches data from market-data-ingestion-service
└─ Generates portfolio simulations

### 4. API Gateway

backend-api-service:
    ↓
├─ Routes requests to appropriate services
├─ Handles authentication via Firebase
├─ Aggregates responses from multiple services
└─ Provides unified API to frontend

## Service Dependencies
### Core Services (Always Running):
1. backend-api-service - Main entry point
2. market-data-ingestion-service - Data foundation
### Engine Services (On-Demand):
3. ai-microservice-engine - Powers AI features
4. python-risk-engine - Powers risk calculations
### Application Services:
5. portfolio-simulation-service - Uses both engines
complete the following    the frontend goes to vercel not containerized
You are an expert DevOps and full-stack engineer. Your task is to analyze my entire codebase and prepare it for containerized deployment.
1. Code Review & Analysis
   * Identify the project structure, programming languages, frameworks, and services.
   * Detect dependencies (system, runtime, package managers).
   * Spot missing or misconfigured environment variables.
2. Dockerization
   * Create optimized Dockerfile(s) for each service or component.
   * Ensure best practices:
      * Use lightweight base images
      * Multi-stage builds for efficiency
      * Non-root user where possible
      * Caching layers correctly
   * Include docker-compose.yml (if multi-service) with proper networking, ports, volumes, and environment handling.
3. Deployment Readiness
   * Document build/run instructions (README update).
   * Suggest improvements for security (e.g., .dockerignore, secret management).
   * Highlight any refactoring needed before smooth containerization.
Your output should include:
* Reviewed notes on my stack and dependencies
* Dockerfile(s) and docker-compose.yml
* Explanations for design choices in containerization strategy