from typing import List, Optional, Union, Dict, Any
from pydantic import AnyHttpUrl, validator, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path
import secrets
from functools import lru_cache

class Settings(BaseSettings):
    # Application Settings
    PROJECT_NAME: str = "Python Engine Service"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    API_PREFIX: str = "/api"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 5000
    RELOAD: bool = False
    WORKERS: int = 1
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        raise ValueError("CORS origins must be a list or comma-separated string")
    
    # Database Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "app"
    POSTGRES_PORT: int = 5432
    DATABASE_URI: Optional[str] = None
    
    @field_validator("DATABASE_URI", mode='before')
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> str:
        if isinstance(v, str):
            return v
        
        if info.data.get("POSTGRES_PASSWORD"):
            return (
                f"postgresql+asyncpg://"
                f"{info.data.get('POSTGRES_USER')}:"
                f"{info.data.get('POSTGRES_PASSWORD')}@"
                f"{info.data.get('POSTGRES_SERVER')}:"
                f"{info.data.get('POSTGRES_PORT', 5432)}/"
                f"{info.data.get('POSTGRES_DB')}"
            )
        return ""
    
    # Security
    SECRET_KEY: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="Secret key for signing JWT tokens. Auto-generated if not set.",
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 1  # 1 day
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_ISSUER: str = "python-engine-service"
    JWT_AUDIENCE: str = "python-engine-clients"
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "1000 per day"
    RATE_LIMIT_AUTHENTICATED: str = "10000 per day"
    
    # API Keys
    API_KEYS: Dict[str, str] = {}
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    ENABLE_OPENAPI: bool = True
    ENABLE_METRICS: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Model configuration
    MODEL_CACHE_DIR: str = "/tmp/models"
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    LOGS_DIR: Path = BASE_DIR / "logs"
    
    # Security Headers
    SECURITY_HEADERS: Dict[str, str] = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    }
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        env_nested_delimiter="__",
        validate_assignment=True,
    )
    
    @model_validator(mode='after')
    def validate_settings(self) -> 'Settings':
        """Validate settings after model initialization."""
        # Ensure required directories exist
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Set environment
        if os.getenv("ENVIRONMENT") == "production":
            self.DEBUG = False
            self.ENVIRONMENT = "production"
            self.LOG_LEVEL = "INFO"
            
            # Enforce secure settings in production
            if self.SECRET_KEY == "your-secret-key-here":
                self.SECRET_KEY = secrets.token_urlsafe(64)
            
            if not self.SENTRY_DSN and self.ENVIRONMENT == "production":
                import warnings
                warnings.warn(
                    "SENTRY_DSN is not set. Error tracking will be disabled.",
                    RuntimeWarning
                )
        
        return self

@lru_cache()
def get_settings() -> Settings:
    ""
    Get the application settings, cached for performance.
    
    Returns:
        Settings: The application settings
    """
    return Settings()

# Global settings instance
settings = get_settings()
