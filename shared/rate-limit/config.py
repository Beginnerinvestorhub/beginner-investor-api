from pydantic_settings import BaseSettings
from functools import lru_cache

class RateLimitSettings(BaseSettings):
    # Redis connection (reuse from redis config)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str | None = None
    REDIS_DB: int = 0
    
    # Rate limit defaults
    RATE_LIMIT_ENABLED: bool = True
    DEFAULT_RATE_LIMIT: int = 100  # requests
    DEFAULT_RATE_PERIOD: int = 3600  # per hour (in seconds)
    
    # Different tiers
    ANONYMOUS_RATE_LIMIT: int = 10
    ANONYMOUS_RATE_PERIOD: int = 60  # per minute
    
    AUTHENTICATED_RATE_LIMIT: int = 100
    AUTHENTICATED_RATE_PERIOD: int = 3600  # per hour
    
    PREMIUM_RATE_LIMIT: int = 1000
    PREMIUM_RATE_PERIOD: int = 3600  # per hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_rate_limit_settings():
    return RateLimitSettings()