from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel
import logging

# Import services
from src.services.affiliate_injector import AffiliateInjector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Microservice")

# Initialize services
affiliate_injector = AffiliateInjector()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class AffiliateInjectionRequest(BaseModel):
    content: str
    affiliate_link: str
    context: str = ""
    model: str = "gpt-3.5-turbo"

class AffiliateSuggestionRequest(BaseModel):
    content: str
    context: str = ""
    model: str = "gpt-3.5-turbo"

class SEOOptimizationRequest(BaseModel):
    content: str
    affiliate_link: str
    keywords: List[str]
    context: str = ""
    model: str = "gpt-3.5-turbo"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "AI Microservice API - Affiliate Injection Service"}

# Inject affiliate link into content
@app.post("/api/v1/affiliate/inject")
async def inject_affiliate_link(request: AffiliateInjectionRequest):
    """
    Inject an affiliate link into the provided content naturally.
    
    - **content**: The original content to inject the link into
    - **affiliate_link**: The affiliate link to inject
    - **context**: Additional context about the content or audience (optional)
    - **model**: The AI model to use (default: gpt-3.5-turbo)
    """
    try:
        result = await affiliate_injector.inject_affiliate_link(
            content=request.content,
            affiliate_link=request.affiliate_link,
            context=request.context,
            model=request.model
        )
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Error in inject_affiliate_link: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get affiliate product suggestions
@app.post("/api/v1/affiliate/suggest")
async def get_affiliate_suggestions(request: AffiliateSuggestionRequest):
    """
    Get relevant affiliate product suggestions based on the content.
    
    - **content**: The content to analyze for product suggestions
    - **context**: Additional context about the content or audience (optional)
    - **model**: The AI model to use (default: gpt-3.5-turbo)
    """
    try:
        suggestions = await affiliate_injector.suggest_affiliate_products(
            content=request.content,
            context=request.context,
            model=request.model
        )
        return {"status": "success", "data": suggestions}
    except Exception as e:
        logger.error(f"Error in get_affiliate_suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Optimize content for SEO with affiliate link
@app.post("/api/v1/affiliate/optimize-seo")
async def optimize_content_seo(request: SEOOptimizationRequest):
    """
    Optimize content for SEO while naturally incorporating an affiliate link.
    
    - **content**: The original content to optimize
    - **affiliate_link**: The affiliate link to include
    - **keywords**: List of target keywords for SEO
    - **context**: Additional context about the content or audience (optional)
    - **model**: The AI model to use (default: gpt-3.5-turbo)
    """
    try:
        optimized_content = await affiliate_injector.optimize_for_seo(
            content=request.content,
            affiliate_link=request.affiliate_link,
            keywords=request.keywords,
            context=request.context,
            model=request.model
        )
        return {"status": "success", "data": optimized_content}
    except Exception as e:
        logger.error(f"Error in optimize_content_seo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8002)),
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
