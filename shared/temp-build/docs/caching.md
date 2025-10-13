# Caching Strategy

This document outlines the caching strategy implemented in the Beginner Investor Hub backend API.

## Overview

We use Redis as our caching layer to improve application performance by reducing database load and decreasing response times for frequently accessed data.

## Cache Invalidation

We use the following cache invalidation strategies:

1. **Time-based expiration (TTL)**: All cached items have a time-to-live (TTL) after which they are automatically evicted from the cache.
2. **Explicit invalidation**: When data is modified, we explicitly invalidate the relevant cache entries.
3. **Pattern-based invalidation**: We can invalidate groups of related cache entries using key patterns.

## Cache Keys

Cache keys follow this naming convention:

- `{entity}:{id}` - Single entity by ID (e.g., `user:123`)
- `{entity}:list:{filter}` - Filtered list of entities (e.g., `products:list:category=electronics`)
- `{entity}:{id}:{related}` - Related entities (e.g., `user:123:orders`)
- `config:{key}` - Configuration values

## Usage

### Basic Caching

```typescript
import { redisService } from '../services/redis/redis.service';

// Set a value in cache
await redisService.set('user:123', userData, 3600); // TTL in seconds

// Get a value from cache
const user = await redisService.get('user:123');

// Delete a value from cache
await redisService.del('user:123');
```

### Cache-Aside Pattern

```typescript
async function getUser(userId: string) {
  return redisService.withCache(
    `user:${userId}`,
    async () => {
      // This function is called if the key is not in cache
      return prisma.user.findUnique({ where: { id: userId } });
    },
    300 // TTL in seconds (optional, defaults to 300)
  );
}
```

### Cache Invalidation

```typescript
// Invalidate a single key
await redisService.del('user:123');

// Invalidate multiple keys by pattern
await redisService.invalidatePattern('user:123:*');
```

## Cache Warming

We use a cache warming script to preload frequently accessed data into the cache. This script runs:

1. On application startup (in production)
2. After deployments
3. On a schedule (e.g., every hour)

To run the cache warming script manually:

```bash
# Development
npm run warm-cache:dev

# Production
npm run warm-cache:prod
```

## Monitoring

Cache hit/miss rates and other metrics are exposed via the application's metrics endpoint at `/metrics`.

## Best Practices

1. Always set a reasonable TTL for cached items
2. Use the cache-aside pattern for database queries
3. Invalidate cache entries when data is modified
4. Use descriptive and consistent key names
5. Monitor cache hit rates and adjust TTLs as needed
