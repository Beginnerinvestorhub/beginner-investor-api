# AI Microservice with Behavioral Nudge Integration

## Overview
This service combines AI capabilities with behavioral finance to provide personalized investment nudges to users. It uses GPT-4 to generate context-aware, educational, and actionable recommendations based on user behavior, portfolio metrics, and market conditions.

## Features
- Personalized investment nudges
- Context-aware recommendations
- Educational content integration
- Risk awareness alerts
- Goal tracking notifications
- Market opportunity insights

## API Endpoints

### Generate Nudge
```http
POST /nudge/generate
```
Generates a personalized investment nudge based on user context.

### Batch Generate Nudges
```http
POST /nudge/batch
```
Generates nudges for multiple users/contexts in one request.

### Get Nudge Types
```http
GET /nudge/types
```
Returns available nudge types and their descriptions.

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:
```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false

# API Keys and External Services
API_KEY=your-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
FINANCIAL_MODELING_PREP_API_KEY=your-fmp-key

# AI Model Configuration
MODEL_VERSION=gpt-4
MODEL_TEMPERATURE=0.7
MAX_TOKENS=2048

# See .env.example for all available options
```

3. Never commit `.env` files to version control
4. Use environment-specific configurations for different deployments
5. Use secret management systems in production

## Integration with Behavioral Nudge Engine

The AI microservice enhances the behavioral nudge engine by:
1. Analyzing user behavior patterns
2. Generating personalized recommendations
3. Providing educational content
4. Monitoring risk tolerance
5. Tracking investment goals

### Nudge Types

1. **Educational Nudges**
   - Investment concept explanations
   - Market terminology
   - Strategy insights

2. **Risk Warning Nudges**
   - Portfolio concentration alerts
   - Market volatility warnings
   - Risk tolerance misalignment

3. **Opportunity Nudges**
   - Market timing suggestions
   - Diversification opportunities
   - Rebalancing recommendations

4. **Goal Tracking Nudges**
   - Progress updates
   - Milestone celebrations
   - Adjustment suggestions

## Development

### Setup
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Running the Service
```bash
uvicorn src.main:app --reload --port 8002
```

### Testing
```bash
pytest tests/
```

## Integration Example

```python
from httpx import AsyncClient

async def get_investment_nudge(user_context):
    async with AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/nudge/generate",
            json=user_context
        )
        return response.json()

# Example context
context = {
    "user_id": "user123",
    "investment_experience": "beginner",
    "risk_profile": {
        "risk_tolerance": 7,
        "max_drawdown": 0.15
    },
    "portfolio_metrics": {
        "volatility": 0.12,
        "sharpe_ratio": 1.5,
        "diversification": 0.8
    },
    "recent_actions": [
        {
            "type": "trade",
            "description": "Bought tech stocks",
            "timestamp": "2025-09-24T10:00:00Z"
        }
    ],
    "market_conditions": {
        "market_volatility": "high",
        "trend": "bullish",
        "sector_performance": "tech_leading"
    }
}
```