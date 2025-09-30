from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .services.ai_nudge_service import AIEnhancedNudgeService, NudgeContext, NudgeResponse
from typing import Dict, Any, List
import logging
import os
from dotenv import load_dotenv

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
        "features": ["behavioral_nudge", "ai_enhancement"],
        "version": "1.0.0"
    }

@app.post("/nudge/generate", response_model=NudgeResponse)
async def generate_nudge(context: NudgeContext):
    """Generate a personalized investment nudge"""
    try:
        return await ai_nudge_service.generate_personalized_nudge(context)
    except Exception as e:
        logger.error(f"Error generating nudge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nudge/batch", response_model=List[NudgeResponse])
async def generate_batch_nudges(contexts: List[NudgeContext]):
    """Generate nudges for multiple users/contexts"""
    try:
        responses = []
        for context in contexts:
            nudge = await ai_nudge_service.generate_personalized_nudge(context)
            responses.append(nudge)
        return responses
    except Exception as e:
        logger.error(f"Error generating batch nudges: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/nudge/types")
async def get_nudge_types():
    """Get available nudge types and their descriptions"""
    return {
        "educational": "Learning opportunities and investment concepts",
        "risk_warning": "Alerts about potential portfolio risks",
        "opportunity": "Market opportunities and timing suggestions",
        "goal_tracking": "Progress updates and goal-related recommendations"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)