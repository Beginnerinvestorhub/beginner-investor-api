from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import logging
import json
from .config import get_middleware_settings

settings = get_middleware_settings()
logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all incoming requests and outgoing responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not settings.REQUEST_LOGGING_ENABLED:
            return await call_next(request)
        
        # Start timer
        start_time = time.time()
        
        # Get request info
        request_id = getattr(request.state, 'request_id', 'unknown')
        method = request.method
        url = str(request.url)
        client_host = request.client.host if request.client else "unknown"
        
        # Log request body if enabled
        request_body = None
        if settings.LOG_REQUEST_BODY and method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                request_body = body.decode('utf-8')[:1000]  # Limit to 1000 chars
            except:
                request_body = "[Unable to read body]"
        
        # Log request
        logger.info(
            f"Request started: {method} {url}",
            extra={
                "request_id": request_id,
                "method": method,
                "url": url,
                "client": client_host,
                "user_agent": request.headers.get("user-agent"),
                "body": request_body
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Request completed: {method} {url} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "url": url,
                    "status_code": response.status_code,
                    "process_time": f"{process_time:.3f}s"
                }
            )
            
            # Add processing time header
            response.headers["X-Process-Time"] = f"{process_time:.3f}"
            
            return response
            
        except Exception as e:
            # Log error
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: {method} {url}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "url": url,
                    "error": str(e),
                    "process_time": f"{process_time:.3f}s"
                },
                exc_info=True
            )
            raise