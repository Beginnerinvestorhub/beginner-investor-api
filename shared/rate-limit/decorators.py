from functools import wraps
from typing import Callable
from fastapi import Request, HTTPException, status
from .redis_client import get_rate_limit_redis_sync
from .limiter import RateLimiter
from .dependencies import get_client_identifier

def rate_limit(max_requests: int, period: int):
    """
    Decorator for rate limiting
    Usage: @rate_limit(max_requests=10, period=60)
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find request object in args
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                # If no request found, just execute function
                return await func(*args, **kwargs)
            
            identifier = get_client_identifier(request)
            redis_client = get_rate_limit_redis_sync()
            limiter = RateLimiter(redis_client)
            
            is_allowed, rate_info = limiter.check_rate_limit(
                identifier,
                max_requests,
                period
            )
            
            if not is_allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit": rate_info["limit"],
                        "reset": rate_info["reset"]
                    }
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator