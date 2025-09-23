"""Health check endpoints for monitoring service status."""
import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import async_session_factory
from app.schemas import BaseResponse, ErrorResponse
from app.utils.health import (
    HealthCheck,
    HealthCheckResult,
    async_check_database,
    async_check_redis,
    async_check_storage,
    async_check_external_service,
)

router = APIRouter()

class HealthCheckResponse(BaseResponse):
    """Health check response model."""
    status: str
    version: str
    timestamp: datetime
    checks: Dict[str, HealthCheckResult]
    details: Optional[Dict[str, Any]] = None

@router.get(
    "/health",
    response_model=HealthCheckResponse,
    responses={
        200: {"description": "Service is healthy"},
        503: {"model": ErrorResponse, "description": "Service is unhealthy"},
    },
    tags=["health"],
)
async def health_check() -> HealthCheckResponse:
    """
    Comprehensive health check endpoint.
    
    This endpoint checks the status of all critical dependencies and services.
    Returns 200 if all checks pass, 503 if any check fails.
    """
    # Initialize health check
    health = HealthCheck("Python Engine Service")
    
    # Add checks
    health.add_check("api", lambda: {"status": "ok"})
    
    # Add database check
    if settings.DATABASE_URI:
        health.add_async_check("database", async_check_database)
    
    # Add Redis check if configured
    if settings.REDIS_URL:
        health.add_async_check("cache", async_check_redis)
    
    # Add storage check
    health.add_async_check("storage", async_check_storage)
    
    # Add external service checks
    if settings.ENABLE_EXTERNAL_CHECKS:
        health.add_async_check(
            "external_api",
            lambda: async_check_external_service("https://api.example.com/health")
        )
    
    # Run all checks
    results = await health.run_checks()
    
    # Check if all checks passed
    all_healthy = all(result.status == "ok" for result in results.values())
    
    # Prepare response
    response = HealthCheckResponse(
        success=all_healthy,
        status="healthy" if all_healthy else "degraded",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        checks=results,
    )
    
    # Add details if any check failed
    if not all_healthy:
        response.details = {
            "unhealthy_services": [
                name for name, result in results.items()
                if result.status != "ok"
            ]
        }
    
    # Return appropriate status code
    if all_healthy:
        return response
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=response.model_dump(),
        )

@router.get(
    "/health/liveness",
    response_model=HealthCheckResponse,
    tags=["health"],
)
async def liveness_probe() -> HealthCheckResponse:
    """
    Liveness probe for Kubernetes.
    
    This is a lightweight check that only verifies the service is running.
    """
    return HealthCheckResponse(
        success=True,
        status="ok",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        checks={"liveness": HealthCheckResult(status="ok")},
    )

@router.get(
    "/health/readiness",
    response_model=HealthCheckResponse,
    responses={
        200: {"description": "Service is ready to accept traffic"},
        503: {"model": ErrorResponse, "description": "Service is not ready"},
    },
    tags=["health"],
)
async def readiness_probe() -> HealthCheckResponse:
    """
    Readiness probe for Kubernetes.
    
    This checks if the service is ready to accept traffic by verifying
    all critical dependencies.
    """
    health = HealthCheck("Python Engine Service")
    
    # Add critical checks only
    if settings.DATABASE_URI:
        health.add_async_check("database", async_check_database)
    
    if settings.REDIS_URL:
        health.add_async_check("cache", async_check_redis)
    
    # Run checks
    results = await health.run_checks()
    all_ready = all(result.status == "ok" for result in results.values())
    
    response = HealthCheckResponse(
        success=all_ready,
        status="ready" if all_ready else "not_ready",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        checks=results,
    )
    
    if not all_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=response.model_dump(),
        )
    
    return response

@router.get(
    "/health/startup",
    response_model=HealthCheckResponse,
    tags=["health"],
)
async def startup_probe() -> HealthCheckResponse:
    """
    Startup probe for Kubernetes.
    
    This is used by Kubernetes to determine when the container has started.
    """
    return HealthCheckResponse(
        success=True,
        status="started",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        checks={"startup": HealthCheckResult(status="ok")},
    )
