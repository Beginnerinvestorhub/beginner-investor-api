from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import asyncio
from .config import get_middleware_settings

settings = get_middleware_settings()

class TimeoutMiddleware(BaseHTTPMiddleware):
    """Add timeout to requests"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await asyncio.wait_for(
                call_next(request),
                timeout=settings.REQUEST_TIMEOUT
            )
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Request timeout after {settings.REQUEST_TIMEOUT} seconds"
            )