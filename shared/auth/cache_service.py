"""
Enhanced Redis Cache Service for Authentication
"""
import json
import logging
import hashlib
from typing import Any, Optional, Dict, Callable
import asyncio
from functools import wraps
import redis
from datetime import datetime, timedelta
from fastapi import HTTPException, status

from ..redis.cache_utils import cache_set, cache_get, cache_delete
from ..redis.config import get_settings
from ..rate_limit.limiter import RateLimiter
from ..rate_limit.config import get_rate_limit_settings

logger = logging.getLogger(__name__)
redis_settings = get_settings()
rate_limit_settings = get_rate_limit_settings()


class AuthCacheService:
    """Enhanced cache service specifically for authentication data"""

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.rate_limiter = RateLimiter(redis_client)

    def _make_cache_key(self, prefix: str, identifier: str) -> str:
        """Create a consistent cache key"""
        # Create a hash of the identifier for consistent key length
        key_hash = hashlib.md5(identifier.encode()).hexdigest()[:16]
        return f"auth:{prefix}:{key_hash}"

    async def cache_user_session(self, user_id: str, session_data: Dict[str, Any], ttl: int = None) -> bool:
        """Cache user session data"""
        key = self._make_cache_key("session", user_id)
        return await cache_set(self.redis, key, session_data, ttl or 3600)

    async def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get cached user session data"""
        key = self._make_cache_key("session", user_id)
        return await cache_get(self.redis, key)

    async def invalidate_user_session(self, user_id: str) -> bool:
        """Invalidate cached user session"""
        key = self._make_cache_key("session", user_id)
        return await cache_delete(self.redis, key)

    async def cache_user_profile(self, user_id: str, profile_data: Dict[str, Any], ttl: int = None) -> bool:
        """Cache user profile data"""
        key = self._make_cache_key("profile", user_id)
        return await cache_set(self.redis, key, profile_data, ttl or 1800)

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get cached user profile data"""
        key = self._make_cache_key("profile", user_id)
        return await cache_get(self.redis, key)

    async def invalidate_user_profile(self, user_id: str) -> bool:
        """Invalidate cached user profile"""
        key = self._make_cache_key("profile", user_id)
        return await cache_delete(self.redis, key)

    async def cache_auth_attempt(self, email: str, attempt_data: Dict[str, Any], ttl: int = None) -> bool:
        """Cache authentication attempt data"""
        key = self._make_cache_key("auth_attempt", email)
        return await cache_set(self.redis, key, attempt_data, ttl or 900)  # 15 minutes

    async def get_auth_attempt(self, email: str) -> Optional[Dict[str, Any]]:
        """Get cached authentication attempt data"""
        key = self._make_cache_key("auth_attempt", email)
        return await cache_get(self.redis, key)

    async def invalidate_auth_attempt(self, email: str) -> bool:
        """Invalidate cached authentication attempt"""
        key = self._make_cache_key("auth_attempt", email)
        return await cache_delete(self.redis, key)

    def check_rate_limit(self, identifier: str, max_requests: int = None, period: int = None) -> tuple[bool, dict]:
        """Check rate limit for identifier"""
        max_req = max_requests or rate_limit_settings.RATE_LIMIT_MAX_REQUESTS
        period_sec = period or rate_limit_settings.RATE_LIMIT_WINDOW_MS // 1000

        return self.rate_limiter.check_rate_limit(identifier, max_req, period_sec)

    def reset_rate_limit(self, identifier: str) -> bool:
        """Reset rate limit for identifier"""
        return self.rate_limiter.reset_rate_limit(identifier)

    def get_rate_limit_info(self, identifier: str, max_requests: int = None, period: int = None) -> dict:
        """Get rate limit info for identifier"""
        max_req = max_requests or rate_limit_settings.RATE_LIMIT_MAX_REQUESTS
        period_sec = period or rate_limit_settings.RATE_LIMIT_WINDOW_MS // 1000

        return self.rate_limiter.get_rate_limit_info(identifier, max_req, period_sec)


def cache_auth_data(ttl: int = 3600, key_prefix: str = "auth"):
    """Decorator to cache authentication data"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Try to get from cache first
            cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
            cached_result = await cache_get(redis.Redis(connection_pool=redis.ConnectionPool(
                host=redis_settings.REDIS_HOST,
                port=redis_settings.REDIS_PORT,
                password=redis_settings.REDIS_PASSWORD,
                db=redis_settings.REDIS_DB,
                decode_responses=True
            )), cache_key)

            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result

            # Execute function and cache result
            result = await func(*args, **kwargs)

            # Cache the result
            await cache_set(redis.Redis(connection_pool=redis.ConnectionPool(
                host=redis_settings.REDIS_HOST,
                port=redis_settings.REDIS_PORT,
                password=redis_settings.REDIS_PASSWORD,
                db=redis_settings.REDIS_DB,
                decode_responses=True
            )), cache_key, result, ttl)

            logger.debug(f"Cache miss for {func.__name__}, cached result")
            return result
        return wrapper
    return decorator


def rate_limit_auth(max_requests: int = 5, period: int = 300, identifier_func: Callable = None):
    """Decorator to apply rate limiting to authentication functions"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get identifier (default to first arg if it's a string/email)
            identifier = "default"
            if identifier_func:
                identifier = identifier_func(*args, **kwargs)
            elif args and isinstance(args[0], str):
                identifier = args[0]

            # Check rate limit
            rate_limiter = RateLimiter(redis.Redis(connection_pool=redis.ConnectionPool(
                host=redis_settings.REDIS_HOST,
                port=redis_settings.REDIS_PORT,
                password=redis_settings.REDIS_PASSWORD,
                db=redis_settings.REDIS_DB,
                decode_responses=True
            )))

            is_allowed, rate_info = rate_limiter.check_rate_limit(identifier, max_requests, period)

            if not is_allowed:
                logger.warning(f"Rate limit exceeded for {identifier}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Try again in {rate_info['reset_in_seconds']} seconds",
                    headers={
                        "X-RateLimit-Limit": str(rate_info["limit"]),
                        "X-RateLimit-Remaining": str(rate_info["remaining"]),
                        "X-RateLimit-Reset": str(rate_info["reset"])
                    }
                )

            # Execute function
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Global cache service instance
def get_auth_cache_service() -> AuthCacheService:
    """Get global auth cache service instance"""
    redis_client = redis.Redis(connection_pool=redis.ConnectionPool(
        host=redis_settings.REDIS_HOST,
        port=redis_settings.REDIS_PORT,
        password=redis_settings.REDIS_PASSWORD,
        db=redis_settings.REDIS_DB,
        decode_responses=True
    ))
    return AuthCacheService(redis_client)
