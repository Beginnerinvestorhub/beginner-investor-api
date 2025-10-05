import logging
import json
from typing import Any, Dict, Optional
from datetime import datetime
import traceback
import time
import asyncio
from functools import wraps

# Create a default logger instance for shared utilities
logger = logging.getLogger('shared-utils')
logger.setLevel(logging.INFO)

# Add a console handler if no handlers exist
if not logger.handlers:
    console_handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

class JSONFormatter(logging.Formatter):
    """Format logs as JSON"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add extra fields
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        
        # Add exception info
        if record.exc_info:
            log_data['exception'] = traceback.format_exception(*record.exc_info)
        
        return json.dumps(log_data)

def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: Optional[str] = None,
    json_format: bool = False
) -> logging.Logger:
    """Setup logger with consistent configuration"""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler()
    
    if json_format:
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

def log_execution_time(logger: logging.Logger, level: str = "INFO"):
    """Decorator to log function execution time"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start
                getattr(logger, level.lower())(
                    f"{func.__name__} completed in {duration:.3f}s"
                )
                return result
            except Exception as e:
                duration = time.time() - start
                logger.error(
                    f"{func.__name__} failed after {duration:.3f}s: {str(e)}"
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start
                getattr(logger, level.lower())(
                    f"{func.__name__} completed in {duration:.3f}s"
                )
                return result
            except Exception as e:
                duration = time.time() - start
                logger.error(
                    f"{func.__name__} failed after {duration:.3f}s: {str(e)}"
                )
                raise
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator
