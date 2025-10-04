"""
Portfolio Simulation Service

A FastAPI-based service for running portfolio simulations and risk analysis.
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

try:
    from .core.config import settings
    from .api.v1.api import api_router
    from .core.security import verify_token
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all modules are properly structured")
    raise

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Portfolio Simulation Service for running financial simulations",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "0.1.0"
    }

# Example protected endpoint
@app.get(f"{settings.API_V1_STR}/simulations/test")
async def test_protected_route(token: str = Depends(verify_token)):
    """Test protected endpoint with token verification."""
    return {
        "message": "This is a protected endpoint",
        "user_id": token.get("sub")
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "message": "Portfolio Simulation Service",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS
    )
