import os
from typing import Any, Optional, Type, TypeVar
from pydantic import BaseSettings
from functools import lru_cache
import json

T = TypeVar('T', bound=BaseSettings)

def load_config(config_class: Type[T], env_file: str = ".env") -> T:
    """Load configuration from environment and .env file"""
    return config_class(_env_file=env_file)

@lru_cache()
def get_env(key: str, default: Optional[str] = None) -> str:
    """Get environment variable with caching"""
    return os.getenv(key, default)

def get_bool_env(key: str, default: bool = False) -> bool:
    """Get boolean environment variable"""
    value = os.getenv(key, str(default))
    return value.lower() in ('true', '1', 'yes', 'on')

def get_int_env(key: str, default: int = 0) -> int:
    """Get integer environment variable"""
    value = os.getenv(key, str(default))
    try:
        return int(value)
    except ValueError:
        return default

def get_float_env(key: str, default: float = 0.0) -> float:
    """Get float environment variable"""
    value = os.getenv(key, str(default))
    try:
        return float(value)
    except ValueError:
        return default

def get_list_env(key: str, default: Optional[list] = None, separator: str = ",") -> list:
    """Get list from environment variable"""
    value = os.getenv(key)
    if value is None:
        return default or []
    return [item.strip() for item in value.split(separator)]

def get_json_env(key: str, default: Any = None) -> Any:
    """Get JSON from environment variable"""
    value = os.getenv(key)
    if value is None:
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default

class ConfigValidator:
    """Validate required configuration"""
    
    @staticmethod
    def require_env(*keys: str):
        """Ensure environment variables are set"""
        missing = [key for key in keys if not os.getenv(key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    @staticmethod
    def validate_url(url: Optional[str], name: str):
        """Validate URL format"""
        if url and not url.startswith(('http://', 'https://')):
            raise ValueError(f"{name} must be a valid URL")
    
    @staticmethod
    def validate_positive_int(value: Optional[int], name: str):
        """Validate positive integer"""
        if value is not None and value <= 0:
            raise ValueError(f"{name} must be positive")