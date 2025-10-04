import redis
import os
import logging
from typing import Generator
from .config import get_settings

settings = get_settings()

# Set up logger
logger = logging.getLogger(__name__)

# Create connection pool for better performance
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    db=settings.REDIS_DB,
    decode_responses=True,
    max_connections=20
)

logger.info(f"Redis connection pool created for {settings.REDIS_HOST}:{settings.REDIS_PORT}")

def get_redis_client() -> Generator:
    """FastAPI dependency for Redis client"""
    client = redis.Redis(connection_pool=redis_pool)
    try:
        logger.debug("Redis client acquired from pool")
        yield client
    finally:
        client.close()
        logger.debug("Redis client returned to pool")

# For non-dependency use
def get_redis_sync():
    return redis.Redis(connection_pool=redis_pool)
