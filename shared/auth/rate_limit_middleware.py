"""
FastAPI Rate Limiting Middleware
"""
import time
import logging
from typing import Callable, Optional
from fastapi import Request, HTTPException, status, Response
from fastapi.responses import JSONResponse
import redis

from ..rate_limit.limiter import RateLimiter
from ..rate_limit.config import get_rate_limit_settings
from ..redis.config import get_settings

logger = logging.getLogger(__name__)
rate_limit_settings = get_rate_limit_settings()
redis_settings = get_settings()


class RateLimitMiddleware:
    """FastAPI rate limiting middleware"""

    def __init__(self, app, redis_client: Optional[redis.Redis] = None):
        self.app = app
        self.rate_limiter = RateLimiter(redis_client or redis.Redis(connection_pool=redis.ConnectionPool(
            host=redis_settings.REDIS_HOST,
            port=redis_settings.REDIS_PORT,
            password=redis_settings.REDIS_PASSWORD,
            db=redis_settings.REDIS_DB,
            decode_responses=True
        )))

    async def __call__(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for certain paths
        skip_paths = ["/health", "/docs", "/redoc", "/openapi.json"]
        if request.url.path in skip_paths:
            return await call_next(request)

        # Get client identifier
        client_id = self._get_client_identifier(request)

        # Check rate limit
        is_allowed, rate_info = self.rate_limiter.check_rate_limit(
            client_id,
            rate_limit_settings.RATE_LIMIT_MAX_REQUESTS,
            rate_limit_settings.RATE_LIMIT_WINDOW_MS // 1000
        )

        # Add rate limit info to request state for later use
        request.state.rate_limit_info = rate_info

        if not is_allowed:
            logger.warning(f"Rate limit exceeded for client: {client_id}")

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded",
                    "limit": rate_info["limit"],
                    "remaining": rate_info["remaining"],
                    "reset": rate_info["reset"],
                    "retry_after": rate_info["reset_in_seconds"]
                },
                headers={
                    "X-RateLimit-Limit": str(rate_info["limit"]),
                    "X-RateLimit-Remaining": str(rate_info["remaining"]),
                    "X-RateLimit-Reset": str(rate_info["reset"]),
                    "Retry-After": str(rate_info["reset_in_seconds"])
                }
            )

        response = await call_next(request)
        return response

    def _get_client_identifier(self, request: Request) -> str:
        """Get unique client identifier"""
        # Try to get user ID from JWT token if available
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # Extract user ID from JWT token (simplified)
            try:
                import jwt
                from ...config import get_config
                config = get_config()
                token = auth_header.split(" ")[1]
                payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
                if payload.get("user_id"):
                    return f"user:{payload['user_id']}"
            except:
                pass

        # Fall back to IP address
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"


def get_rate_limit_info(request: Request) -> dict:
    """Get rate limit information from request state"""
    return getattr(request.state, 'rate_limit_info', {})


class AuthRateLimitMiddleware:
    """Authentication-specific rate limiting middleware"""

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.rate_limiter = RateLimiter(redis_client or redis.Redis(connection_pool=redis.ConnectionPool(
            host=redis_settings.REDIS_HOST,
            port=redis_settings.REDIS_PORT,
            password=redis_settings.REDIS_PASSWORD,
            db=redis_settings.REDIS_DB,
            decode_responses=True
        )))

    async def __call__(self, request: Request, call_next: Callable) -> Response:
        # Only apply to auth endpoints
        if not request.url.path.startswith("/auth/"):
            return await call_next(request)

        # Different rate limits for different auth endpoints
        path_limits = {
            "/auth/login": (5, 300),  # 5 login attempts per 5 minutes
            "/auth/register": (3, 3600),  # 3 registrations per hour
            "/auth/forgot-password": (3, 900),  # 3 password resets per 15 minutes
            "/auth/refresh": (10, 300),  # 10 token refreshes per 5 minutes
        }

        endpoint_limit = path_limits.get(request.url.path, (5, 300))
        max_requests, period = endpoint_limit

        # Get identifier (email for login/register, IP for others)
        identifier = self._get_auth_identifier(request)

        # Check rate limit
        is_allowed, rate_info = self.rate_limiter.check_rate_limit(
            identifier,
            max_requests,
            period
        )

        # Add rate limit info to request state
        request.state.rate_limit_info = rate_info

        if not is_allowed:
            logger.warning(f"Auth rate limit exceeded for {identifier} on {request.url.path}")

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Too many {request.url.path.replace('/auth/', '')} attempts",
                    "limit": rate_info["limit"],
                    "remaining": rate_info["remaining"],
                    "reset": rate_info["reset"],
                    "retry_after": rate_info["reset_in_seconds"]
                },
                headers={
                    "X-RateLimit-Limit": str(rate_info["limit"]),
                    "X-RateLimit-Remaining": str(rate_info["remaining"]),
                    "X-RateLimit-Reset": str(rate_info["reset"]),
                    "Retry-After": str(rate_info["reset_in_seconds"])
                }
            )

        response = await call_next(request)
        return response

    def _get_auth_identifier(self, request: Request) -> str:
        """Get identifier for auth rate limiting"""
        # For login and register, use email if provided in request body
        if request.url.path in ["/auth/login", "/auth/register"]:
            try:
                body = request._body if hasattr(request, '_body') else None
                if body:
                    import json
                    data = json.loads(body)
                    if data.get("email"):
                        return f"email:{data['email']}"
            except:
                pass

        # Fall back to IP address
        client_ip = request.client.host if request.client else "unknown"
        return f"auth_ip:{client_ip}"


# Global instances
def get_rate_limiter() -> RateLimiter:
    """Get global rate limiter instance"""
    redis_client = redis.Redis(connection_pool=redis.ConnectionPool(
        host=redis_settings.REDIS_HOST,
        port=redis_settings.REDIS_PORT,
        password=redis_settings.REDIS_PASSWORD,
        db=redis_settings.REDIS_DB,
        decode_responses=True
    ))
    return RateLimiter(redis_client)


def get_auth_rate_limiter() -> AuthRateLimitMiddleware:
    """Get auth-specific rate limiter instance"""
    return AuthRateLimitMiddleware()
