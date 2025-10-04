from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from .config import get_middleware_settings

settings = get_middleware_settings()

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        if settings.SECURITY_HEADERS_ENABLED:
            # Prevent clickjacking
            response.headers["X-Frame-Options"] = "DENY"
            
            # Prevent MIME type sniffing
            response.headers["X-Content-Type-Options"] = "nosniff"
            
            # Enable XSS protection
            response.headers["X-XSS-Protection"] = "1; mode=block"
            
            # Strict transport security (HTTPS only)
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
            # Content Security Policy
            response.headers["Content-Security-Policy"] = "default-src 'self'"
            
            # Referrer policy
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            
            # Permissions policy
            response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response