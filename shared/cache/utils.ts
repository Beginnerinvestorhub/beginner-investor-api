// shared/cache/utils.ts
import { CacheManager } from './cache-manager';
import { RedisClient } from './redis-client';
import type { CacheHealth, WarmCacheConfig } from './types';

/**
 * Warm cache by preloading frequently accessed data
 */
export async function warmCache(config: WarmCacheConfig): Promise<void> {
  const cacheManager = new CacheManager();
  const { keys, parallel = true, batchSize = 10 } = config;

  console.log(`🔥 Warming cache with ${keys.length} keys...`);

  if (parallel) {
    // Process in batches
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ({ key, fetcher, ttl, namespace }) => {
          try {
            const value = await fetcher();
            await cacheManager.set(key, value, { ttl, namespace });
            console.log(`✅ Cached: ${namespace ? namespace + ':' : ''}${key}`);
          } catch (error) {
            console.error(`❌ Failed to cache ${key}:`, error);
          }
        })
      );
    }
  } else {
    // Process sequentially
    for (const { key, fetcher, ttl, namespace } of keys) {
      try {
        const value = await fetcher();
        await cacheManager.set(key, value, { ttl, namespace });
        console.log(`✅ Cached: ${namespace ? namespace + ':' : ''}${key}`);
      } catch (error) {
        console.error(`❌ Failed to cache ${key}:`, error);
      }
    }
  }

  console.log('🔥 Cache warming complete!');
}

/**
 * Get cache health metrics
 */
export async function getCacheHealth(): Promise<CacheHealth> {
  const redis = RedisClient.getInstance();

  try {
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;

    const info = await redis.info('memory');
    const statsInfo = await redis.info('stats');

    // Parse memory usage
    const usedMemoryMatch = info.match(/used_memory:(\d+)/);
    const maxMemoryMatch = info.match(/maxmemory:(\d+)/);
    const usedMemory = usedMemoryMatch?.[1] ? parseInt(usedMemoryMatch[1], 10) : 0;
    const maxMemory = maxMemoryMatch?.[1] ? parseInt(maxMemoryMatch[1], 10) : 0;

    // Parse uptime
    const uptimeMatch = statsInfo.match(/uptime_in_seconds:(\d+)/);
    const uptime = uptimeMatch?.[1] ? parseInt(uptimeMatch[1], 10) : 0;

    // Get key count
    const dbSize = await redis.dbSize();

    return {
      connected: true,
      latency,
      memoryUsage: {
        used: usedMemory,
        max: maxMemory,
        percentage: maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0,
      },
      keyCount: dbSize,
      uptime,
    };
  } catch (error) {
    console.error('Error getting Redis stats:', error);
    return {
      connected: false,
      latency: 0,
      memoryUsage: { used: 0, max: 0, percentage: 0 },
      keyCount: 0,
      uptime: 0,
    };
  }
}
