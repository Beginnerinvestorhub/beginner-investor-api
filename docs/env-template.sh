# Environment Configuration Template
# Copy this file to .env and fill in your actual values

# Database Configuration
DB_NAME=fintech_db
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Node.js Environment
NODE_ENV=production

# API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
FINNHUB_API_KEY=your_finnhub_api_key
OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json

# AI Configuration
AI_MODEL=gpt-4

# Service Configuration
DATA_INGESTION_INTERVAL=300
RISK_CALCULATION_WORKERS=4
SIMULATION_WORKERS=2

# Development Settings (for docker-compose.dev.yml)
LOG_LEVEL=info