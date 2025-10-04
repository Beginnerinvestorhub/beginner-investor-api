from functools import wraps
from typing import Callable
import json
import logging
import hashlib
from .redis_client import get_redis_sync
from .config import get_settings

settings = get_settings()

# Set up logger
logger = logging.getLogger(__name__)

def cached(ttl: int = None, key_prefix: str = ""):
    """Decorator to cache FastAPI route responses"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key_parts = [key_prefix or func.__name__]

            # Add args and kwargs to cache key
            for arg in args:
                if not isinstance(arg, (dict, list)):
                    cache_key_parts.append(str(arg))

            for k, v in sorted(kwargs.items()):
                if not isinstance(v, (dict, list)):
                    cache_key_parts.append(f"{k}:{v}")

            cache_key = ":".join(cache_key_parts)

            # Try to get from cache
            redis_client = get_redis_sync()
            try:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    logger.debug(f"Cache hit for key: {cache_key}")
                    return json.loads(cached_data)
            except Exception as e:
                logger.error(f"Cache read error for key {cache_key}: {e}")

            # Execute function
            logger.debug(f"Cache miss for key: {cache_key}, executing function")
            result = await func(*args, **kwargs)

            # Store in cache
            try:
                cache_ttl = ttl or settings.REDIS_CACHE_TTL
                redis_client.setex(
                    cache_key,
                    cache_ttl,
                    json.dumps(result)
                )
                logger.debug(f"Cache stored for key: {cache_key}")
            except Exception as e:
                logger.error(f"Cache write error for key {cache_key}: {e}")

            return result

        return wrapper
    return decorator