import { RedisService } from './redis/redis.service';

export abstract class BaseService {
  protected redisService: RedisService;
  protected cacheTtl: number;

  constructor(cacheTtl: number = 300) {
    this.redisService = RedisService.getInstance();
    this.cacheTtl = cacheTtl;
  }

  protected async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.cacheTtl
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.redisService.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch from source
      const data = await fetchFn();
      
      // Cache the result
      await this.redisService.set(key, data, ttl);
      
      return data;
    } catch (error) {
      // If Redis fails, fall back to direct fetch
      console.error(`Cache error for key ${key}:`, error);
      return fetchFn();
    }
  }

  protected async invalidateCache(keys: string | string[]): Promise<void> {
    try {
      if (Array.isArray(keys)) {
        await Promise.all(keys.map(key => this.redisService.del(key)));
      } else {
        await this.redisService.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  protected generateCacheKey(prefix: string, ...args: any[]): string {
    const argsString = args
      .map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          return JSON.stringify(arg);
        }
        return String(arg);
      })
      .join(':');
    
    return `${prefix}:${argsString}`.toLowerCase();
  }
}
