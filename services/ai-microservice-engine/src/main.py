from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .services.ai_nudge_service import AIEnhancedNudgeService, NudgeContext, NudgeResponse
from .models.database import get_db, AINudgeHistory, AIModelUsage
from typing import Dict, Any, List
import logging
import os
from dotenv import load_dotenv
from datetime import datetime
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Microservice with Behavioral Nudge Integration",
    description="AI-powered service for generating personalized investment nudges",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Nudge Service
ai_nudge_service = AIEnhancedNudgeService(
    model_name=os.getenv("AI_MODEL_VERSION", "gpt-4"),
    temperature=float(os.getenv("AI_TEMPERATURE", "0.7")),
    max_tokens=int(os.getenv("AI_MAX_TOKENS", "150"))
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-microservice",
        "features": ["behavioral_nudge", "ai_enhancement", "database_storage"],
        "version": "1.0.0"
    }

@app.post("/nudge/generate", response_model=NudgeResponse)
async def generate_nudge(context: NudgeContext, db = Depends(get_db)):
    """Generate a personalized investment nudge"""
    start_time = time.time()

    try:
        nudge_response = await ai_nudge_service.generate_personalized_nudge(context)

        # Store in database
        db_nudge = AINudgeHistory(
            user_id=context.user_id,
            nudge_type=nudge_response.type,
            message=nudge_response.message,
            priority=nudge_response.priority,
            action_items=nudge_response.action_items,
            resources=nudge_response.resources,
            nudge_metadata=nudge_response.metadata
        )

        db.add(db_nudge)
        db.commit()
        db.refresh(db_nudge)

        # Track AI model usage
        response_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        db_usage = AIModelUsage(
            model_name=ai_nudge_service.model_name,
            tokens_used=ai_nudge_service.max_tokens,  # Approximation
            cost_usd=0.02,  # GPT-4 approximate cost
            response_time_ms=response_time,
            user_id=context.user_id,
            nudge_type=nudge_response.type
        )

        db.add(db_usage)
        db.commit()

        # Add database ID to response metadata
        nudge_response.metadata["database_id"] = db_nudge.id

        return nudge_response

    except Exception as e:
        logger.error(f"Error generating nudge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nudge/batch", response_model=List[NudgeResponse])
async def generate_batch_nudges(contexts: List[NudgeContext], db = Depends(get_db)):
    """Generate nudges for multiple users/contexts"""
    responses = []

    for context in contexts:
        try:
            nudge = await generate_nudge(context, db)
            responses.append(nudge)
        except Exception as e:
            logger.error(f"Error generating nudge for user {context.user_id}: {str(e)}")
            # Continue with other nudges

    return responses

@app.get("/nudge/types")
async def get_nudge_types():
    """Get available nudge types and their descriptions"""
    return {
        "educational": "Learning opportunities and investment concepts",
        "risk_warning": "Alerts about potential portfolio risks",
        "opportunity": "Market opportunities and timing suggestions",
        "goal_tracking": "Progress updates and goal-related recommendations"
    }

@app.get("/nudge/history/{user_id}")
async def get_nudge_history(user_id: str, db = Depends(get_db)):
    """Get nudge history for a specific user"""
    nudges = db.query(AINudgeHistory).filter(AINudgeHistory.user_id == user_id).all()

    return [
        {
            "id": nudge.id,
            "type": nudge.nudge_type,
            "message": nudge.message,
            "priority": nudge.priority,
            "action_items": nudge.action_items,
            "resources": nudge.resources,
            "metadata": nudge.nudge_metadata,  # Return as 'metadata' in API response
            "created_at": nudge.created_at.isoformat(),
            "delivered": nudge.delivered.isoformat() if nudge.delivered else None,
            "interacted": nudge.interacted.isoformat() if nudge.interacted else None,
            "interaction_type": nudge.interaction_type
        }
        for nudge in nudges
    ]

@app.get("/analytics/usage")
async def get_usage_analytics(db = Depends(get_db)):
    """Get AI model usage analytics"""
    usage_stats = db.query(AIModelUsage).all()

    total_requests = len(usage_stats)
    total_tokens = sum(usage.tokens_used for usage in usage_stats)
    total_cost = sum(usage.cost_usd for usage in usage_stats)
    avg_response_time = sum(usage.response_time_ms for usage in usage_stats) / total_requests if total_requests > 0 else 0

    return {
        "total_requests": total_requests,
        "total_tokens_used": total_tokens,
        "total_cost_usd": round(total_cost, 4),
        "average_response_time_ms": round(avg_response_time, 2),
        "unique_users": len(set(usage.user_id for usage in usage_stats if usage.user_id)),
        "nudge_types": list(set(usage.nudge_type for usage in usage_stats if usage.nudge_type))
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)