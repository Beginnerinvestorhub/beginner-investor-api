import redis
from typing import Generator
from .config import get_rate_limit_settings

settings = get_rate_limit_settings()

# Create Redis connection pool for rate limiting
rate_limit_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    db=settings.REDIS_DB,
    decode_responses=True,
    max_connections=20
)

def get_rate_limit_redis() -> Generator:
    """FastAPI dependency for rate limit Redis client"""
    client = redis.Redis(connection_pool=rate_limit_pool)
    try:
        yield client
    finally:
        client.close()

def get_rate_limit_redis_sync():
    """Sync Redis client for rate limiting"""
    return redis.Redis(connection_pool=rate_limit_pool)