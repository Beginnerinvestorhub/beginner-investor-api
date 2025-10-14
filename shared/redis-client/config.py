import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Redis Configuration - Support both URL and individual settings
    REDIS_URL: Optional[str] = None
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_CACHE_TTL: int = 3600

    # Parse Redis URL if provided, otherwise use individual settings
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.REDIS_URL:
            # Parse Redis URL format: redis://[password@]host:port/db
            from urllib.parse import urlparse
            parsed = urlparse(self.REDIS_URL)

            if parsed.hostname:
                self.REDIS_HOST = parsed.hostname
            if parsed.port:
                self.REDIS_PORT = parsed.port
            if parsed.password:
                self.REDIS_PASSWORD = parsed.password
            if parsed.path and parsed.path.strip('/'):
                try:
                    self.REDIS_DB = int(parsed.path.strip('/'))
                except ValueError:
                    pass  # Keep default DB if path is not a number

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()