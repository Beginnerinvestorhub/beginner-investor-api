# Redis Integration for Beginner Investor Hub

## Overview

Redis has been fully integrated into the Beginner Investor Hub application for both caching and rate limiting functionality. This provides significant performance improvements and protects against abuse.

## Architecture

### Components

1. **Redis Client** (`shared/cache/redis-client.ts`)
   - Singleton Redis client using ioredis
   - Connection management and retry logic
   - Health checking capabilities

2. **Cache Manager** (`shared/cache/cache-manager.ts`)
   - High-level caching operations
   - Pipeline support for batch operations
   - Namespace support for key organization

3. **Rate Limiter** (`shared/cache/rate-limiter.ts`)
   - Distributed rate limiting using Redis
   - Multiple rate limit configurations
   - Express.js middleware support

4. **Cache Middleware** (`services/backend-api/src/middleware/cache.middleware.ts`)
   - HTTP response caching middleware
   - Customizable cache key generation
   - Cache invalidation utilities

## Configuration

### Environment Variables

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
REDIS_KEY_PREFIX=bih:
```

### Redis Configuration (`config/redis-config.conf`)

The configuration file defines:
- Rate limiting windows and limits
- Cache TTL values by data type
- Key patterns for consistency
- Connection pool settings

## Usage Examples

### Basic Caching

```typescript
import { cacheManager } from '@/shared/cache/init';

// Set a value with TTL
await cacheManager.set('user:123', { name: 'John', preferences: {...} }, {
  ttl: 3600, // 1 hour
  namespace: 'user'
});

// Get a value
const user = await cacheManager.get('user:123', { namespace: 'user' });

// Get or set pattern
const data = await cacheManager.getOrSet('expensive:computation', async () => {
  return await expensiveComputation();
}, { ttl: 1800 });
```

### Rate Limiting

```typescript
import { rateLimiter, RATE_LIMITS } from '@/shared/cache/rate-limiter';

// Check rate limit manually
const result = await rateLimiter.check(request, RATE_LIMITS.API);
if (!result.success) {
  return { error: 'Rate limit exceeded', retryAfter: result.resetTime };
}

// Use middleware
app.use('/api', rateLimiter.createMiddleware(RATE_LIMITS.API));
```

### Express Middleware

```typescript
import { cacheMiddleware, apiRateLimit } from '@/middleware';

// Apply rate limiting to all API routes
app.use('/api', apiRateLimit);

// Apply caching to specific routes
app.get('/api/market-data/:symbol',
  cacheMiddleware({
    ttl: 300, // 5 minutes
    includeQuery: true,
    namespace: 'market'
  }),
  getMarketDataHandler
);

// Custom cache configuration
app.get('/api/user/profile',
  cacheMiddleware({
    ttl: 1800, // 30 minutes
    includeUserId: true,
    namespace: 'user'
  }),
  getUserProfileHandler
);
```

## Cache Invalidation

```typescript
import { CacheInvalidator } from '@/middleware/cache.middleware';

// Invalidate user-specific cache
await CacheInvalidator.invalidateUserCache('user123', 'api');

// Invalidate by pattern
await CacheInvalidator.invalidatePattern('market:*', 'api');

// Clear all cache
await CacheInvalidator.clearAll('api');
```

## Service Integration

### Nudge Service Example

The nudge service demonstrates complete integration:

```typescript
// Using existing cache service
const cachedNudge = await nudgeCacheService.getCachedNudge(userId, message);
if (cachedNudge) {
  return { nudge: cachedNudge, cached: true };
}

// Generate new nudge and cache it
const newNudge = await generateNudge(userId, message);
await nudgeCacheService.cacheNudge(userId, message, newNudge);

return { nudge: newNudge, cached: false };
```

## Performance Benefits

1. **Response Time**: Cached responses are served in <1ms
2. **Database Load**: Reduced queries through intelligent caching
3. **API Protection**: Rate limiting prevents abuse
4. **Scalability**: Distributed caching works across multiple instances

## Monitoring

The system includes built-in monitoring:

- Cache hit/miss ratios
- Rate limit violations
- Redis connection health
- Memory usage tracking

## Development Setup

1. **Local Redis**: Install Redis server locally or use Docker
2. **Environment**: Configure environment variables
3. **Testing**: Use fallback in-memory storage when Redis unavailable
4. **Production**: Ensure Redis is highly available

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server status
   - Verify connection configuration
   - Review firewall settings

2. **High Memory Usage**
   - Monitor cache TTL settings
   - Implement cache cleanup strategies
   - Consider Redis memory limits

3. **Rate Limit Too Strict**
   - Adjust rate limit configurations
   - Monitor usage patterns
   - Implement dynamic rate limiting

### Health Checks

```typescript
import { RedisClient } from '@/shared/cache/redis-client';

// Check Redis health
const isHealthy = await RedisClient.healthCheck();
if (!isHealthy) {
  console.error('Redis is not available');
}
```

## Security Considerations

- Redis passwords should be stored securely
- Network access should be restricted
- Memory usage should be monitored
- Regular cache cleanup is recommended

## Future Enhancements

1. **Redis Cluster**: For horizontal scaling
2. **Cache Warming**: Pre-populate frequently accessed data
3. **Advanced Rate Limiting**: User-tier based limits
4. **Analytics**: Detailed cache performance metrics
