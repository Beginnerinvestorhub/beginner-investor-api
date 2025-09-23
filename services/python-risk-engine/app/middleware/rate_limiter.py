"""
Rate limiting middleware with Redis backend and adaptive rate limiting.

This module provides rate limiting functionality to protect the API from abuse
and ensure fair usage. It supports both in-memory and Redis-based rate limiting,
with configurable limits and window sizes.
"""
import asyncio
import time
from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple, Union

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware import Middleware
from fastapi.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.logging import logger
from app.schemas.common import ErrorResponse

# Default rate limits (requests per minute)
DEFAULT_RATE_LIMIT = 60  # 1 request per second
DEFAULT_WINDOW = 60  # 1 minute

# Rate limit headers
RATELIMIT_LIMIT_HEADER = "X-RateLimit-Limit"
RATELIMIT_REMAINING_HEADER = "X-RateLimit-Remaining"
RATELIMIT_RESET_HEADER = "X-RateLimit-Reset"
RATELIMIT_RETRY_AFTER_HEADER = "Retry-After"

class RateLimitExceeded(HTTPException):
    """Exception raised when a rate limit is exceeded."""
    
    def __init__(
        self, 
        retry_after: int, 
        limit: int, 
        remaining: int, 
        reset_time: int
    ):
        self.retry_after = retry_after
        self.limit = limit
        self.remaining = remaining
        self.reset_time = reset_time
        
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "rate_limit_exceeded",
                "message": f"Rate limit exceeded. Try again in {retry_after} seconds",
                "retry_after": retry_after,
                "limit": limit,
                "remaining": remaining,
                "reset_time": reset_time,
            },
            headers={
                RATELIMIT_LIMIT_HEADER: str(limit),
                RATELIMIT_REMAINING_HEADER: str(remaining),
                RATELIMIT_RESET_HEADER: str(reset_time),
                RATELIMIT_RETRY_AFTER_HEADER: str(retry_after),
            },
        )

class BaseRateLimiter:
    """Base class for rate limiters."""
    
    async def is_rate_limited(
        self, 
        key: str, 
        limit: int, 
        window: int
    ) -> Tuple[bool, int, int, int]:
        """Check if a request should be rate limited.
        
        Args:
            key: The rate limit key (e.g., 'user:123' or 'ip:1.2.3.4')
            limit: Maximum number of requests allowed in the window
            window: Time window in seconds
            
        Returns:
            Tuple of (is_limited, remaining, reset_time, retry_after)
        """
        raise NotImplementedError
    
    async def get_rate_limit_headers(
        self, 
        key: str, 
        limit: int, 
        window: int
    ) -> Dict[str, str]:
        """Get rate limit headers for a request.
        
        Args:
            key: The rate limit key
            limit: Maximum number of requests allowed in the window
            window: Time window in seconds
            
        Returns:
            Dictionary of rate limit headers
        """
        is_limited, remaining, reset_time, _ = await self.is_rate_limited(key, limit, window)
        
        return {
            RATELIMIT_LIMIT_HEADER: str(limit),
            RATELIMIT_REMAINING_HEADER: str(remaining),
            RATELIMIT_RESET_HEADER: str(int(reset_time)),
        }


class RedisRateLimiter(BaseRateLimiter):
    """Redis-based rate limiter using sorted sets."""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.script = self._load_script()
    
    def _load_script(self) -> str:
        """Load the Lua script for rate limiting."""
        script = """
        local key = KEYS[1]           -- rate limit key
        local now = tonumber(ARGV[1]) -- current timestamp
        local window = tonumber(ARGV[2]) -- rate limit window in seconds
        local limit = tonumber(ARGV[3]) -- max requests per window
        
        -- Remove requests outside the current window
        redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
        
        -- Get the current request count
        local current = redis.call('ZCARD', key)
        
        -- If under the limit, add the request
        if current < limit then
            redis.call('ZADD', key, now, now .. ':' .. math.random())
            redis.call('EXPIRE', key, window)
            return {0, limit - current - 1, now + window, 0}
        end
        
        -- Otherwise, find when the next request will be allowed
        local oldest = tonumber(redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')[2])
        local reset_time = oldest + window
        local retry_after = reset_time - now
        
        return {1, 0, reset_time, retry_after}
        """
        return self.redis.script_load(script)
    
    async def is_rate_limited(
        self, 
        key: str, 
        limit: int, 
        window: int
    ) -> Tuple[bool, int, int, int]:
        """Check if a request is rate limited.
        
        Args:
            key: The rate limit key
            limit: Maximum number of requests allowed in the window
            window: Time window in seconds
            
        Returns:
            Tuple of (is_limited, remaining, reset_time, retry_after)
        """
        try:
            now = int(time.time())
            result = await self.redis.evalsha(
                self.script,
                1,  # Number of keys
                key,
                now,
                window,
                limit
            )
            
            if isinstance(result, list) and len(result) >= 4:
                is_limited = bool(result[0])
                remaining = max(0, int(result[1]))
                reset_time = int(result[2])
                retry_after = max(0, int(result[3])) if len(result) > 3 else 0
                
                return is_limited, remaining, reset_time, retry_after
            
            # If there's an issue with the script, fail open
            return False, limit, now + window, 0
            
        except redis.RedisError as e:
            # If Redis is down, log the error but allow the request
            logger.error(f"Redis error in rate limiter: {str(e)}")
            return False, limit, int(time.time()) + window, 0


class InMemoryRateLimiter(BaseRateLimiter):
    """In-memory rate limiter for development and testing."""
    
    def __init__(self):
        self.requests = {}
    
    async def is_rate_limited(
        self, 
        key: str, 
        limit: int, 
        window: int
    ) -> Tuple[bool, int, int, int]:
        """Check if a request is rate limited."""
        now = int(time.time())
        
        # Initialize or clean up the request list for this key
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests outside the current window
        self.requests[key] = [t for t in self.requests[key] if t > now - window]
        
        # Check if we're over the limit
        if len(self.requests[key]) >= limit:
            # Calculate when the next request will be allowed
            oldest = self.requests[key][0]
            reset_time = oldest + window
            retry_after = reset_time - now
            return True, 0, reset_time, max(0, retry_after)
        
        # Add the current request
        self.requests[key].append(now)
        remaining = max(0, limit - len(self.requests[key]))
        
        return False, remaining, now + window, 0

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting requests."""
    
    def __init__(
        self,
        app: ASGIApp,
        rate_limiter: BaseRateLimiter,
        default_limit: int = DEFAULT_RATE_LIMIT,
        default_window: int = DEFAULT_WINDOW,
        exempt_paths: Optional[List[str]] = None,
        ip_header: Optional[str] = None,
    ):
        super().__init__(app)
        self.rate_limiter = rate_limiter
        self.default_limit = default_limit
        self.default_window = default_window
        self.exempt_paths = set(exempt_paths or [])
        self.ip_header = ip_header
        
        # Rate limit rules by path pattern
        self.rules: List[RateLimitRule] = []
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip rate limiting for exempt paths and OPTIONS requests
        if (
            request.method == "OPTIONS" or 
            request.url.path in self.exempt_paths or
            any(request.url.path.startswith(path) for path in self.exempt_paths)
        ):
            return await call_next(request)
        
        # Get the client IP address
        client_ip = self._get_client_ip(request)
        
        # Create a rate limit key based on the request
        key = self._get_rate_limit_key(request, client_ip)
        
        # Get rate limit settings for this request
        limit, window = self._get_rate_limit_settings(request)
        
        try:
            # Check if the request is rate limited
            is_limited, remaining, reset_time, retry_after = await self.rate_limiter.is_rate_limited(
                key, limit, window
            )
            
            # Add rate limit headers to the response
            headers = {
                RATELIMIT_LIMIT_HEADER: str(limit),
                RATELIMIT_REMAINING_HEADER: str(remaining),
                RATELIMIT_RESET_HEADER: str(int(reset_time)),
            }
            
            # If rate limited, return an error response
            if is_limited:
                logger.warning(
                    f"Rate limit exceeded for {key}: {request.method} {request.url.path}"
                )
                
                response = JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "rate_limit_exceeded",
                        "message": "Too many requests. Please try again later.",
                        "retry_after": retry_after,
                        "limit": limit,
                        "remaining": remaining,
                    },
                )
                
                # Add rate limit headers
                for k, v in headers.items():
                    response.headers[k] = str(v)
                
                # Add retry-after header
                response.headers[RATELIMIT_RETRY_AFTER_HEADER] = str(retry_after)
                
                return response
            
            # Process the request
            response = await call_next(request)
            
            # Add rate limit headers to successful responses
            for k, v in headers.items():
                response.headers[k] = str(v)
                
            return response
            
        except Exception as e:
            # If there's an error with rate limiting, log it but allow the request
            logger.error(f"Rate limiting error: {str(e)}", exc_info=True)
            return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get the client IP address from the request."""
        if self.ip_header and self.ip_header in request.headers:
            # Handle X-Forwarded-For format: "client, proxy1, proxy2"
            forwarded_for = request.headers[self.ip_header]
            return forwarded_for.split(",")[0].strip()
        
        # Fall back to the client host if no header is configured
        return request.client.host if request.client else "unknown"
    
    def _get_rate_limit_key(self, request: Request, client_ip: str) -> str:
        """Generate a rate limit key for the request."""
        # Try to get the user ID from the request state (set by auth middleware)
        user_id = getattr(request.state, "user_id", None)
        
        # Use API key if available
        api_key = request.headers.get("x-api-key")
        
        # Create a key based on the available identifiers
        if user_id:
            # Authenticated user
            return f"user:{user_id}:{request.method}:{request.url.path}"
        elif api_key:
            # API key authentication
            key_id = api_key.split(".")[0] if "." in api_key else api_key[:8]
            return f"apikey:{key_id}:{request.method}:{request.url.path}"
        else:
            # IP-based rate limiting (least preferred)
            return f"ip:{client_ip}:{request.method}:{request.url.path}"
    
    def _get_rate_limit_settings(self, request: Request) -> Tuple[int, int]:
        """Get the rate limit settings for the request."""
        # Check for custom rate limit headers
        custom_limit = request.headers.get("X-RateLimit-Limit")
        custom_window = request.headers.get("X-RateLimit-Window")
        
        if custom_limit and custom_window:
            try:
                return int(custom_limit), int(custom_window)
            except (ValueError, TypeError):
                pass
        
        # Apply different limits based on authentication status
        if hasattr(request.state, "user_id") or "x-api-key" in request.headers:
            # Authenticated requests get higher limits
            return self.default_limit * 10, self.default_window
        
        # Default rate limit for unauthenticated requests
        return self.default_limit, self.default_window


def get_rate_limit_middleware(
    redis_url: Optional[str] = None,
    default_limit: int = DEFAULT_RATE_LIMIT,
    default_window: int = DEFAULT_WINDOW,
    exempt_paths: Optional[List[str]] = None,
    ip_header: Optional[str] = None,
) -> Middleware:
    """Create a rate limit middleware instance.
    
    Args:
        redis_url: Redis URL for distributed rate limiting (None for in-memory)
        default_limit: Default number of requests allowed per window
        default_window: Default time window in seconds
        exempt_paths: List of paths to exclude from rate limiting
        ip_header: Header to use for client IP (e.g., 'X-Forwarded-For')
        
    Returns:
        FastAPI middleware instance
    """
    # Create the appropriate rate limiter
    if redis_url:
        try:
            redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
            rate_limiter = RedisRateLimiter(redis_client)
            logger.info("Using Redis-based rate limiting")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}. Falling back to in-memory rate limiting.")
            rate_limiter = InMemoryRateLimiter()
    else:
        rate_limiter = InMemoryRateLimiter()
        logger.info("Using in-memory rate limiting")
    
    # Set default exempt paths if none provided
    if exempt_paths is None:
        exempt_paths = [
            "/health",
            "/metrics",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/favicon.ico",
        ]
    
    return Middleware(
        RateLimitMiddleware,
        rate_limiter=rate_limiter,
        default_limit=default_limit,
        default_window=default_window,
        exempt_paths=exempt_paths,
        ip_header=ip_header,
    )


def rate_limited(
    limit: int = DEFAULT_RATE_LIMIT,
    window: int = DEFAULT_WINDOW,
    key_func: Optional[Callable[[Request], str]] = None,
):
    """Decorator to apply rate limiting to a specific endpoint.
    
    Example:
        @app.get("/api/limited")
        @rate_limited(limit=10, window=60)  # 10 requests per minute
        async def limited_endpoint():
            return {"message": "This endpoint is rate limited"}
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Get the rate limiter from the app state
            rate_limiter = request.app.state.rate_limiter
            
            # Get the rate limit key
            if key_func:
                key = key_func(request)
            else:
                client_ip = request.client.host if request.client else "unknown"
                key = f"endpoint:{request.url.path}:{client_ip}"
            
            # Check rate limit
            is_limited, remaining, reset_time, retry_after = await rate_limiter.is_rate_limited(
                key, limit, window
            )
            
            # If rate limited, raise an exception
            if is_limited:
                raise RateLimitExceeded(
                    retry_after=retry_after,
                    limit=limit,
                    remaining=remaining,
                    reset_time=reset_time,
                )
            
            # Call the original function
            response = await func(request, *args, **kwargs)
            
            # Add rate limit headers
            if isinstance(response, Response):
                response.headers[RATELIMIT_LIMIT_HEADER] = str(limit)
                response.headers[RATELIMIT_REMAINING_HEADER] = str(remaining)
                response.headers[RATELIMIT_RESET_HEADER] = str(int(reset_time))
            
            return response
        
        return wrapper
    
    return decorator
