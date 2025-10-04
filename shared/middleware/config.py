from pydantic_settings import BaseSettings
from functools import lru_cache

class MiddlewareSettings(BaseSettings):
    # CORS settings
    CORS_ENABLED: bool = True
    CORS_ALLOW_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]
    
    # Security headers
    SECURITY_HEADERS_ENABLED: bool = True
    
    # Request logging
    REQUEST_LOGGING_ENABLED: bool = True
    LOG_REQUEST_BODY: bool = False
    LOG_RESPONSE_BODY: bool = False
    
    # Request ID
    REQUEST_ID_HEADER: str = "X-Request-ID"
    
    # Timeouts
    REQUEST_TIMEOUT: int = 30  # seconds
    
    # Compression
    COMPRESSION_ENABLED: bool = True
    COMPRESSION_MIN_SIZE: int = 1000  # bytes
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_middleware_settings():
    return MiddlewareSettings()