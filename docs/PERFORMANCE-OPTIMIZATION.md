# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Beginner Investor Hub backend API and provides guidelines for maintaining and improving performance.

## Table of Contents

1. [Caching Strategy](#caching-strategy)
2. [Database Optimization](#database-optimization)
3. [API Performance](#api-performance)
4. [Monitoring and Metrics](#monitoring-and-metrics)
5. [Best Practices](#best-practices)
6. [Performance Testing](#performance-testing)

## Caching Strategy

We use a multi-layered caching approach to reduce database load and improve response times:

### Redis Cache

- **What's Cached**:
  - Frequently accessed data (user profiles, leaderboards)
  - Computationally expensive queries
  - API responses with low volatility

- **Cache Invalidation**:
  - Time-based expiration (TTL)
  - Event-based invalidation
  - Tag-based invalidation for related data

### Implementation

```typescript
// Basic caching example
const user = await cacheOptimizer.withCache(
  ['user', userId],
  () => prisma.user.findUnique({ where: { id: userId } }),
  { ttl: 3600, tags: [`user:${userId}`] }
);

// Invalidate cache when data changes
await cacheOptimizer.invalidate(`user:${userId}`);
// Or by tag
await cacheOptimizer.invalidate('tag:leaderboard');
```

## Database Optimization

### Query Optimization

- Use indexes for frequently queried fields
- Limit the number of returned records
- Select only needed fields
- Use pagination for large datasets

### Example: Optimized Query

```typescript
// Before (inefficient)
const users = await prisma.user.findMany({
  where: { active: true },
  include: { posts: true }
});

// After (optimized)
const users = await prisma.user.findMany({
  where: { active: true },
  select: {
    id: true,
    name: true,
    email: true,
    _count: { select: { posts: true } } // Count instead of full relation
  },
  take: 50, // Limit results
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit // Pagination
});
```

### Indexing Strategy

1. **Add indexes** for:
   - Foreign keys
   - Frequently filtered/sorted columns
   - Composite indexes for common query patterns

2. **Example Migration**:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  
  @@index([email])
  @@index([createdAt])
}
```

## API Performance

### Response Compression

Enable GZIP compression for all responses:

```typescript
import compression from 'compression';

// Enable compression
app.use(compression(performanceConfig.getCompressionConfig()));
```

### Rate Limiting

Protect your API from abuse with rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: performanceConfig.rateLimiting.windowMs,
  max: performanceConfig.rateLimiting.max,
  message: performanceConfig.rateLimiting.message,
});

// Apply to all requests
app.use(limiter);
```

### Response Caching

Cache API responses when appropriate:

```typescript
// Cache GET requests for 5 minutes
app.get('/api/leaderboard', 
  cacheMiddleware('5 minutes'),
  async (req, res) => {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  }
);
```

## Monitoring and Metrics

### Performance Metrics

We collect the following metrics:

- Request/response times
- Error rates
- Cache hit/miss ratios
- Database query performance
- Memory and CPU usage

### Setting Up Monitoring

1. **Prometheus + Grafana**:
   - Collect and visualize metrics
   - Set up alerts for anomalies

2. **Logging**:
   - Structured logging with correlation IDs
   - Log slow requests and errors

3. **APM Tools**:
   - New Relic
   - Datadog
   - Elastic APM

## Best Practices

### Code Level

1. **Avoid N+1 Queries**:
   ```typescript
   // Bad
   const users = await prisma.user.findMany();
   for (const user of users) {
     const posts = await prisma.post.findMany({ where: { userId: user.id } });
   }
   
   // Good
   const usersWithPosts = await prisma.user.findMany({
     include: { posts: true }
   });
   ```

2. **Use Batch Operations**:
   ```typescript
   // Instead of multiple updates
   await prisma.$transaction([
     prisma.user.update({ where: { id: 1 }, data: { status: 'active' } }),
     prisma.user.update({ where: { id: 2 }, data: { status: 'active' } }),
   ]);
   ```

3. **Optimize JSON Responses**:
   - Remove unnecessary fields
   - Use pagination
   - Consider GraphQL for flexible querying

### Infrastructure

1. **Database**:
   - Use read replicas for read-heavy workloads
   - Configure connection pooling
   - Regular maintenance (VACUUM, ANALYZE for PostgreSQL)

2. **Caching**:
   - Use CDN for static assets
   - Implement edge caching
   - Consider in-memory caching for frequently accessed data

3. **Horizontal Scaling**:
   - Stateless application design
   - Session storage in Redis
   - Load balancing

## Performance Testing

### Tools

1. **k6**: Load testing
   ```javascript
   import http from 'k6/http';
   import { sleep } from 'k6';
   
   export const options = {
     vus: 10,
     duration: '30s',
   };
   
   export default function () {
     http.get('https://api.example.com/endpoint');
     sleep(1);
   }
   ```

2. **Autocannon**: HTTP benchmarking
   ```bash
   npx autocannon -c 100 -d 20 -p 10 https://api.example.com/endpoint
   ```

### Test Scenarios

1. **Load Testing**:
   - Simulate expected traffic
   - Identify bottlenecks
   - Measure response times under load

2. **Stress Testing**:
   - Determine breaking point
   - Test auto-scaling
   - Failover scenarios

3. **Soak Testing**:
   - Long-running tests
   - Memory leaks
   - Database connection handling

## Performance Budget

| Metric                     | Budget       |
|----------------------------|--------------|
| Time to First Byte (TTFB)  | < 200ms      |
| Page Load Time             | < 2s         |
| API Response Time (p95)    | < 500ms      |
| Time to Interactive (TTI)  | < 3.5s       |
| Max Bundle Size            | < 200KB      |
| Max Image Size             | < 100KB      |

## Monitoring Alerts

Set up alerts for:

- Response time > 1s (p95)
- Error rate > 1%
- CPU usage > 80% for 5 minutes
- Memory usage > 90%
- Cache hit rate < 80%
