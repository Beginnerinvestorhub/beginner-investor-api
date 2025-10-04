import asyncio
import logging
from redis_client import get_rate_limit_redis_sync
from limiter import RateLimiter

# Set up logger
logger = logging.getLogger(__name__)

async def test_rate_limiter():
    redis_client = get_rate_limit_redis_sync()
    limiter = RateLimiter(redis_client)

    identifier = "test_user_123"
    max_requests = 5
    period = 10  # 10 seconds

    logger.info(f"Testing rate limiter: {max_requests} requests per {period} seconds")
    print("=" * 60)

    # Reset before testing
    limiter.reset_rate_limit(identifier)

    # Make requests
    for i in range(7):
        is_allowed, info = limiter.check_rate_limit(identifier, max_requests, period)

        status = "✓ ALLOWED" if is_allowed else "✗ BLOCKED"
        print(f"Request {i+1}: {status}")
        print(f"  Remaining: {info['remaining']}/{info['limit']}")
        print(f"  Current requests: {info['current_requests']}")

        
        if not is_allowed:
            print(f"  Rate limit exceeded! Reset in {info['reset_in_seconds']}s")
        
        await asyncio.sleep(0.5)
    
    # Wait for reset
    print(f"\nWaiting {period} seconds for rate limit reset...")
    await asyncio.sleep(period)
    
    # Try again
    is_allowed, info = limiter.check_rate_limit(identifier, max_requests, period)
    print(f"\nAfter reset: {'✓ ALLOWED' if is_allowed else '✗ BLOCKED'}")
    print(f"Remaining: {info['remaining']}/{info['limit']}")
    
    print("\n✓ Rate limiter test completed!")

if __name__ == "__main__":
    asyncio.run(test_rate_limiter())