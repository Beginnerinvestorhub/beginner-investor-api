import os
from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache


class SharedConfig(BaseSettings):
    """Base configuration class for all shared services"""

    # Application settings
    APP_ENV: str = "development"
    APP_NAME: str = "investment-hub"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database settings
    DATABASE_URL: str = "sqlite:///./investment_hub.db"

    @field_validator('DATABASE_URL')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError('DATABASE_URL is required')
        if not v.startswith(('postgresql://', 'sqlite://')):
            raise ValueError('DATABASE_URL must be a valid PostgreSQL or SQLite URL')
        return v

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379"

    @field_validator('REDIS_URL')
    @classmethod
    def validate_redis_url(cls, v: str) -> str:
        if not v.startswith('redis://'):
            raise ValueError('REDIS_URL must be a valid Redis URL')
        return v

    # Firebase settings
    FIREBASE_PROJECT_ID: str
    FIREBASE_CLIENT_EMAIL: str
    FIREBASE_PRIVATE_KEY: str

    @field_validator('FIREBASE_PRIVATE_KEY')
    @classmethod
    def validate_firebase_key(cls, v: str) -> str:
        if not v:
            raise ValueError('FIREBASE_PRIVATE_KEY is required')
        return v.replace('\\n', '\n')

    # Authentication settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator('JWT_SECRET_KEY')
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError('JWT_SECRET_KEY must be at least 32 characters long')
        return v

    # Rate limiting settings
    RATE_LIMIT_WINDOW_MS: int = 15 * 60 * 1000
    RATE_LIMIT_MAX_REQUESTS: int = 100
    RATE_LIMIT_STRICT_WINDOW_MS: int = 60 * 1000
    RATE_LIMIT_STRICT_MAX_REQUESTS: int = 20

    # Security settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    INTERNAL_SERVICE_SECRET: str = ""

    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "text"

    # OpenAI settings
    OPENAI_API_KEY: Optional[str] = None

    # External service URLs
    AI_MICROSERVICE_URL: str = "http://localhost:8001"
    BEHAVIORAL_NUDGE_ENGINE_URL: str = "http://localhost:8002"
    MARKET_DATA_INGESTION_URL: str = "http://localhost:8003"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.APP_ENV == "production":
            self._validate_production_settings()

    def _validate_production_settings(self):
        if not self.INTERNAL_SERVICE_SECRET:
            raise ValueError("INTERNAL_SERVICE_SECRET is required in production")
        if self.CORS_ORIGINS == ["*"]:
            raise ValueError("CORS_ORIGINS cannot be '*' in production")
        if self.DATABASE_URL.startswith("sqlite://"):
            raise ValueError("SQLite is not recommended for production")


@lru_cache()
def get_config() -> SharedConfig:
    return SharedConfig()


def validate_environment():
    config = get_config()
    if config.DATABASE_URL and "localhost" in config.DATABASE_URL and config.APP_ENV == "production":
        print("WARNING: Using localhost database in production")
    if not config.INTERNAL_SERVICE_SECRET and config.APP_ENV == "production":
        print("WARNING: No internal service secret set in production")
    return True


def get_database_config() -> Dict[str, Any]:
    config = get_config()
    return {
        'url': config.DATABASE_URL,
        'pool_size': 5,
        'max_overflow': 10,
        'pool_timeout': 30,
        'pool_recycle': 3600,
        'echo': config.DEBUG
    }


def get_redis_config() -> Dict[str, Any]:
    config = get_config()
    return {
        'url': config.REDIS_URL,
        'retry_strategy': lambda retries: min(retries * 100, 3000)
    }


def get_firebase_config() -> Dict[str, Any]:
    config = get_config()
    return {
        'project_id': config.FIREBASE_PROJECT_ID,
        'client_email': config.FIREBASE_CLIENT_EMAIL,
        'private_key': config.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
    }


def get_logging_config() -> Dict[str, Any]:
    config = get_config()
    return {
        'level': config.LOG_LEVEL,
        'format': config.LOG_FORMAT,
        'json_format': config.LOG_FORMAT == 'json'
    }


ENV_TEMPLATE = {
    'APP_ENV': 'development',
    'APP_NAME': 'investment-hub',
    'APP_VERSION': '1.0.0',
    'DEBUG': 'false',
    'DATABASE_URL': 'postgresql://user:password@localhost:5432/investment_hub',
    'REDIS_URL': 'redis://localhost:6379',
    'FIREBASE_PROJECT_ID': 'your-firebase-project-id',
    'FIREBASE_CLIENT_EMAIL': 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com',
    'FIREBASE_PRIVATE_KEY': '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n',
    'JWT_SECRET_KEY': 'your-jwt-secret-key-at-least-32-characters-long',
    'JWT_ALGORITHM': 'HS256',
    'JWT_ACCESS_TOKEN_EXPIRE_MINUTES': '30',
    'JWT_REFRESH_TOKEN_EXPIRE_DAYS': '7',
    'RATE_LIMIT_WINDOW_MS': '900000',
    'RATE_LIMIT_MAX_REQUESTS': '100',
    'RATE_LIMIT_STRICT_WINDOW_MS': '60000',
    'RATE_LIMIT_STRICT_MAX_REQUESTS': '20',
    'CORS_ORIGINS': '["http://localhost:3000"]',
    'INTERNAL_SERVICE_SECRET': 'your-internal-service-secret',
    'LOG_LEVEL': 'INFO',
    'LOG_FORMAT': 'text',
    'OPENAI_API_KEY': 'your-openai-api-key',
    'AI_MICROSERVICE_URL': 'http://localhost:8001',
    'BEHAVIORAL_NUDGE_ENGINE_URL': 'http://localhost:8002',
    'MARKET_DATA_INGESTION_URL': 'http://localhost:8003',
}


def generate_env_example(output_path: str = ".env.example"):
    with open(output_path, 'w') as f:
        f.write("# Shared Services Configuration Template\n")
        f.write("# Copy this file to .env and fill in your actual values\n\n")
        for key, value in ENV_TEMPLATE.items():
            if isinstance(value, str) and '\n' in value:
                f.write(f"{key}=\n{value}\n")
            else:
                f.write(f"{key}={value}\n")


if __name__ == "__main__":
    generate_env_example()
    print(".env.example file generated successfully!")
