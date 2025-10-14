import json
import logging
from typing import Any, Optional
import redis
from .config import get_settings

settings = get_settings()

# Set up logger
logger = logging.getLogger(__name__)

async def cache_set(
    client: redis.Redis,
    key: str,
    value: Any,
    ttl: int = None
) -> bool:
    """Store data in cache"""
    try:
        ttl = ttl or settings.REDIS_CACHE_TTL
        serialized = json.dumps(value)
        client.setex(key, ttl, serialized)
        logger.debug(f"Cache set successful for key: {key}")
        return True
    except Exception as e:
        logger.error(f"Cache set error for key {key}: {e}")
        return False

async def cache_get(
    client: redis.Redis,
    key: str
) -> Optional[Any]:
    """Retrieve data from cache"""
    try:
        data = client.get(key)
        if data:
            deserialized = json.loads(data)
            logger.debug(f"Cache hit for key: {key}")
            return deserialized
        logger.debug(f"Cache miss for key: {key}")
        return None
    except Exception as e:
        logger.error(f"Cache get error for key {key}: {e}")
        return None

async def cache_delete(
    client: redis.Redis,
    key: str
) -> bool:
    """Delete data from cache"""
    try:
        client.delete(key)
        logger.debug(f"Cache delete successful for key: {key}")
        return True
    except Exception as e:
        logger.error(f"Cache delete error for key {key}: {e}")
        return False

async def cache_clear_pattern(
    client: redis.Redis,
    pattern: str
) -> int:
    """Delete all keys matching pattern"""
    try:
        keys = client.keys(pattern)
        if keys:
            deleted_count = client.delete(*keys)
            logger.info(f"Cache cleared {deleted_count} keys matching pattern: {pattern}")
            return deleted_count
        logger.debug(f"No keys found matching pattern: {pattern}")
        return 0
    except Exception as e:
        logger.error(f"Cache clear error for pattern {pattern}: {e}")
        return 0