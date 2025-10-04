from fastapi import Request, HTTPException, status, Depends
from redis import Redis
import hashlib
import logging
from typing import Optional
from .redis_client import get_rate_limit_redis
from .limiter import RateLimiter
from .config import get_rate_limit_settings

settings = get_rate_limit_settings()

# Set up logger
logger = logging.getLogger(__name__)

def get_client_identifier(request: Request) -> str:
    """
    Generate unique identifier for rate limiting
    Priority: API Key > User ID > IP Address
    """
    # Check for API key in headers
    api_key = request.headers.get("X-API-Key")
    if api_key:
        identifier = f"api_key:{hashlib.sha256(api_key.encode()).hexdigest()[:16]}"
        logger.debug(f"Rate limit identifier from API key: {identifier}")
        return identifier

    # Check for authenticated user (you'll need to integrate with your auth)
    # user_id = request.state.user_id if hasattr(request.state, 'user_id') else None
    # if user_id:
    #     return f"user:{user_id}"

    # Fall back to IP address
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"

    identifier = f"ip:{client_ip}"
    logger.debug(f"Rate limit identifier from IP: {identifier}")
    return identifier

def get_rate_limit_tier(request: Request) -> tuple[int, int]:
    """
    Determine rate limit tier based on user type
    Returns: (max_requests, period_seconds)
    """
    # Check if authenticated (you'll need to integrate with your auth)
    # if hasattr(request.state, 'user_type'):
    #     if request.state.user_type == 'premium':
    #         return settings.PREMIUM_RATE_LIMIT, settings.PREMIUM_RATE_PERIOD
    #     elif request.state.user_type == 'authenticated':
    #         return settings.AUTHENTICATED_RATE_LIMIT, settings.AUTHENTICATED_RATE_PERIOD

    # Check for API key
    if request.headers.get("X-API-Key"):
        logger.debug("Using authenticated rate limit tier for API key")
        return settings.AUTHENTICATED_RATE_LIMIT, settings.AUTHENTICATED_RATE_PERIOD

    # Default to anonymous tier
    logger.debug("Using anonymous rate limit tier")
    return settings.ANONYMOUS_RATE_LIMIT, settings.ANONYMOUS_RATE_PERIOD

async def rate_limit_dependency(
    request: Request,
    redis_client: Redis = Depends(get_rate_limit_redis)
):
    """
    FastAPI dependency for rate limiting
    Add this to any route that needs rate limiting
    """
    if not settings.RATE_LIMIT_ENABLED:
        logger.debug("Rate limiting disabled")
        return

    identifier = get_client_identifier(request)
    max_requests, period = get_rate_limit_tier(request)

    limiter = RateLimiter(redis_client)
    is_allowed, rate_info = limiter.check_rate_limit(identifier, max_requests, period)

    # Add rate limit headers to response
    request.state.rate_limit_info = rate_info

    if not is_allowed:
        logger.warning(f"Rate limit exceeded for {identifier}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "limit": rate_info["limit"],
                "reset": rate_info["reset"],
                "retry_after": rate_info["reset_in_seconds"]
            },
            headers={
                "X-RateLimit-Limit": str(rate_info["limit"]),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(rate_info["reset"]),
                "Retry-After": str(rate_info["reset_in_seconds"])
            }
        )

class RateLimitCustom:
    """Custom rate limiter with configurable limits"""

    def __init__(self, max_requests: int, period: int):
        self.max_requests = max_requests
        self.period = period

    async def __call__(
        self,
        request: Request,
        redis_client: Redis = Depends(get_rate_limit_redis)
    ):
        if not settings.RATE_LIMIT_ENABLED:
            logger.debug("Rate limiting disabled")
            return

        identifier = get_client_identifier(request)
        limiter = RateLimiter(redis_client)
        is_allowed, rate_info = limiter.check_rate_limit(
            identifier,
            self.max_requests,
            self.period
        )

        request.state.rate_limit_info = rate_info

        if not is_allowed:
            logger.warning(f"Custom rate limit exceeded for {identifier}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": rate_info["limit"],
                    "reset": rate_info["reset"]
                },
                headers={
                    "X-RateLimit-Limit": str(rate_info["limit"]),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(rate_info["reset"]),
                    "Retry-After": str(rate_info["reset_in_seconds"])
                }
            )