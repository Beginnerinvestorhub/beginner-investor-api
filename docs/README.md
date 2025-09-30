# Beginner Investor Hub - Documentation

Welcome to the Beginner Investor Hub documentation. This directory contains all the documentation for the project, organized into the following categories:

## Directory Structure

- **/architecture**: High-level architecture and system design documents
- **/deployment**: Deployment guides and checklists
- **/dockerfiles**: Docker-related files and documentation
- **/api**: API documentation and integration guides

## Getting Started

1. Review the architecture documents to understand the system design
2. Check the deployment guide for setting up your environment
3. Refer to the API documentation for integration details
4. Use the Docker files for containerized deployment

## Contributing

When adding new documentation:
1. Place files in the most appropriate directory
2. Update this README if you add new categories or significant documents
3. Follow the existing naming conventions

flowchart TD
    %% External APIs
    subgraph Data_Ingestion
        AV[Alpha Vantage API]
        FH[Finnhub API]
        OtherAPIs[Other Market Data APIs]
        MarketData[market-data-ingestion-service<br>Container: market-data<br>Port: 3002<br>ENV: DATABASE_URL, REDIS_URL, MARKET_DATA_API_KEY, FINNHUB_API_KEY, ALPHA_VANTAGE_API_KEY]
        AV --> MarketData
        FH --> MarketData
        OtherAPIs --> MarketData
    end

    %% Redis Cache
    RedisCache[External Redis Cache<br>Port: 6379]
    MarketData --> RedisCache
    Database[(PostgreSQL Database<br>Container: beginner-investor-db<br>Port: 5432<br>ENV: DATABASE_URL)] 
    RedisCache --> Database

    %% AI Engine
    subgraph AI_Engine
        AIService[ai-microservice-engine<br>Container: ai-nudge-service<br>Port: 3003<br>ENV: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, AI_MODEL_VERSION, AI_TEMPERATURE, AI_MAX_TOKENS, BEHAVIORAL_NUDGE_ENABLED]
        BehavioralNudge[Embedded ai-behavioral-nudge]
        AIService --> BehavioralNudge
        OpenAI[OpenAI API]
        OpenAI --> AIService
    end

    %% Risk Engine
    subgraph Risk_Engine
        RiskService[python-risk-engine<br>Container: risk-engine<br>Port: 3001<br>ENV: DATABASE_URL, REDIS_URL, RISK_CALCULATION_WORKERS]
        RiskService --> RiskCalculations[Risk Calculations<br>(NumPy/Pandas)]
    end

    %% Portfolio Simulation
    subgraph Portfolio_Simulation
        PortfolioSim[portfolio-simulation-service<br>Container: portfolio-simulation<br>Port: 3004<br>ENV: DATABASE_URL, REDIS_URL, RISK_ENGINE_URL, MARKET_DATA_URL, AI_SERVICE_URL]
        PortfolioSim --> RiskService
        PortfolioSim --> MarketData
        PortfolioSim --> AIService
    end

    %% API Gateway
    subgraph Backend_API
        Backend[backend-api-service<br>Container: backend-api<br>Port: 3000<br>ENV: DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET, CORS_ORIGIN, NODE_ENV]
        Firebase[Firebase Auth]
        Backend --> PortfolioSim
        Backend --> MarketData
        Backend --> AIService
        Backend --> RiskService
        Backend --> Firebase
    end

    %% Frontend
    Frontend[Frontend (Vercel)<br>No container<br>ENV: API_URL]
    Frontend --> Backend
