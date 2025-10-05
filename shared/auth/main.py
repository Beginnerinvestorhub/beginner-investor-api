"""
Main FastAPI Application with Firebase Authentication
"""
from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from .firebase_auth import firebase_auth
from .routes import router as auth_router
from .middleware import get_current_user_optional, get_current_user, get_admin_user
from .rate_limit_middleware import RateLimitMiddleware, AuthRateLimitMiddleware, get_rate_limit_info
from ..config import get_config, get_logging_config
from ..database.connection import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Investment Hub API...")

    # Initialize database
    try:
        create_tables()
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

    # Initialize Firebase if credentials are available
    try:
        # Firebase auth service will initialize itself
        logger.info("Firebase authentication initialized")
    except Exception as e:
        logger.warning(f"Firebase initialization failed: {e}")

    yield

    # Shutdown
    logger.info("Shutting down Investment Hub API...")


# Create FastAPI application
app = FastAPI(
    title="Investment Hub API",
    description="API for Investment Portfolio Management with Firebase Authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Health check endpoint (before middleware to avoid rate limiting)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": "1.0.0"
    }


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware (general API rate limiting)
app.add_middleware(RateLimitMiddleware)

# Authentication-specific rate limiting middleware
app.add_middleware(AuthRateLimitMiddleware)


@app.get("/rate-limit-info")
async def get_rate_limit_status(request: Request):
    """Get current rate limit status for the client"""
    rate_info = get_rate_limit_info(request)
    return {
        "rate_limit_info": rate_info,
        "client_ip": request.client.host if request.client else "unknown"
    }


# Public routes (no authentication required)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Protected routes (authentication required)
@app.get("/api/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile (protected route)"""
    return {
        "message": "This is a protected route",
        "user": current_user
    }


@app.get("/api/admin")
async def admin_dashboard(current_user: dict = Depends(get_admin_user)):
    """Admin dashboard (admin only)"""
    return {
        "message": "Welcome to admin dashboard",
        "user": current_user
    }


# Optional authentication routes
@app.get("/api/public")
async def public_endpoint(current_user: dict = Depends(get_current_user_optional)):
    """Public endpoint with optional authentication"""
    if current_user:
        return {
            "message": "Hello authenticated user!",
            "user": current_user
        }
    else:
        return {
            "message": "Hello anonymous user!"
        }


# Custom middleware for authentication
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """Custom authentication middleware"""
    # Skip authentication for certain paths
    skip_paths = ["/health", "/docs", "/redoc", "/openapi.json"]
    skip_auth_patterns = ["/auth/"]

    if (request.url.path in skip_paths or
        any(request.url.path.startswith(pattern) for pattern in skip_auth_patterns)):
        return await call_next(request)

    # Check for authentication
    try:
        # Try to get current user (will raise exception if not authenticated)
        await get_current_user(request)
    except HTTPException as e:
        if e.status_code == status.HTTP_401_UNAUTHORIZED:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required"},
                headers={"WWW-Authenticate": "Bearer"}
            )
        raise

    response = await call_next(request)
    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=logging_config['level'].lower()
    )
