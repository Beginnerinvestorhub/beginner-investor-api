import redis
import time
import logging
from typing import Tuple, Optional
from .config import get_rate_limit_settings

settings = get_rate_limit_settings()

# Set up logger
logger = logging.getLogger(__name__)

class RateLimiter:
    """Token bucket rate limiter using Redis"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    def check_rate_limit(
        self,
        identifier: str,
        max_requests: int,
        period: int
    ) -> Tuple[bool, dict]:
        """
        Check if request is within rate limit
        
        Args:
            identifier: Unique identifier (user_id, IP, API key, etc.)
            max_requests: Maximum number of requests allowed
            period: Time period in seconds
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        key = f"rate_limit:{identifier}"
        current_time = int(time.time())
        window_start = current_time - period
        
        try:
            # Use sorted set to store request timestamps
            pipe = self.redis.pipeline()
            
            # Remove old entries outside the time window
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count requests in current window
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {current_time: current_time})
            
            # Set expiry on the key
            pipe.expire(key, period)
            
            results = pipe.execute()
            request_count = results[1]
            
            # Calculate remaining requests
            remaining = max(0, max_requests - request_count - 1)
            reset_time = current_time + period
            
            rate_limit_info = {
                "limit": max_requests,
                "remaining": remaining,
                "reset": reset_time,
                "reset_in_seconds": period,
                "current_requests": request_count + 1
            }
            
            is_allowed = request_count < max_requests
            
            if not is_allowed:
                logger.warning(f"Rate limit exceeded for {identifier}: {request_count + 1}/{max_requests} requests in {period}s")
            
            return is_allowed, rate_limit_info
            
        except Exception as e:
            logger.error(f"Rate limit check failed for {identifier}: {e}")
            # Fail open - allow request if Redis is down
            return True, {
                "limit": max_requests,
                "remaining": max_requests,
                "reset": current_time + period,
                "error": str(e)
            }
    
    def reset_rate_limit(self, identifier: str) -> bool:
        """Reset rate limit for an identifier"""
        try:
            key = f"rate_limit:{identifier}"
            result = self.redis.delete(key)
            logger.info(f"Rate limit reset for {identifier}")
            return result > 0
        except Exception as e:
            logger.error(f"Reset rate limit failed for {identifier}: {e}")
            return False
    
    def get_rate_limit_info(
        self,
        identifier: str,
        max_requests: int,
        period: int
    ) -> dict:
        """Get current rate limit info without incrementing"""
        key = f"rate_limit:{identifier}"
        current_time = int(time.time())
        window_start = current_time - period
        
        try:
            # Clean old entries
            self.redis.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            request_count = self.redis.zcard(key)
            
            remaining = max(0, max_requests - request_count)
            reset_time = current_time + period
            
            return {
                "limit": max_requests,
                "remaining": remaining,
                "reset": reset_time,
                "current_requests": request_count
            }
        except Exception as e:
            logger.error(f"Get rate limit info failed for {identifier}: {e}")
            return {
                "limit": max_requests,
                "remaining": max_requests,
                "reset": current_time + period,
                "error": str(e)
            }