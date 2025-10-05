# Redis Setup and Integration for Windsurf Extension

## Overview
This script sets up Redis for caching and rate limiting in the Beginner Investor Hub application.

## Features
- Redis client initialization
- Cache management integration
- Rate limiting middleware
- Fallback to in-memory storage when Redis is unavailable

## Setup Instructions
1. Install Redis server locally or use Docker
2. Run the initialization script
3. Import and use the cache/rate limiting utilities in your services

## Usage
```typescript
import { CacheManager } from '@/shared/cache/cache-manager';
import { rateLimit } from '@/shared/cache/rate-limiter';

const cache = new CacheManager();
await cache.set('key', 'value', { ttl: 3600 });
```

## Redis Configuration
- Host: localhost
- Port: 6379
- Password: (from environment)
- Database: 0
