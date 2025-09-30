import { RedisService } from '../services/redis/redis.service';
import { logger } from './logger';

type CacheOptions = {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  skipCache?: boolean; // Skip cache for this request
};

type CacheKey = string | (string | number | boolean)[];

export class CacheOptimizer {
  private redisService: RedisService;
  private defaultTtl: number;
  private enabled: boolean;

  constructor(redisService: RedisService, defaultTtl: number = 300) {
    this.redisService = redisService;
    this.defaultTtl = defaultTtl;
    this.enabled = process.env.REDIS_ENABLED === 'true';
  }

  /**
   * Generate a cache key from parts
   */
  public generateKey(parts: CacheKey): string {
    if (Array.isArray(parts)) {
      return parts.map(part => String(part)).join(':');
    }
    return String(parts);
  }

  /**
   * Get a value from cache or execute the callback and cache the result
   */
  public async withCache<T>(
    key: CacheKey,
    callback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    if (!this.enabled || options.skipCache) {
      return callback();
    }

    const cacheKey = this.generateKey(key);
    
    try {
      // Try to get from cache
      const cached = await this.redisService.get<T>(cacheKey);
      if (cached !== null) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return cached;
      }

      // Cache miss, execute callback
      logger.debug(`Cache miss: ${cacheKey}`);
      const result = await callback();
      
      // Cache the result
      const ttl = options.ttl ?? this.defaultTtl;
      await this.redisService.set(cacheKey, result, ttl);
      
      // Add to tag groups if tags are provided
      if (options.tags?.length) {
        await this.addToTagGroups(cacheKey, options.tags, ttl);
      }
      
      return result;
    } catch (error) {
      logger.error(`Cache error for key ${cacheKey}:`, error);
      // On cache error, fall back to the callback
      return callback();
    }
  }

  /**
   * Invalidate cache by key pattern or tags
   */
  public async invalidate(pattern: string | string[]): Promise<void> {
    if (!this.enabled) return;
    
    try {
      if (Array.isArray(pattern)) {
        // Invalidate by tags
        await Promise.all(pattern.map(tag => this.invalidateByTag(tag)));
      } else if (pattern.startsWith('tag:')) {
        // Invalidate by tag
        await this.invalidateByTag(pattern.replace('tag:', ''));
      } else {
        // Invalidate by key pattern
        await this.redisService.del(pattern);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  /**
   * Add a key to tag groups for batch invalidation
   */
  private async addToTagGroups(
    key: string, 
    tags: string[], 
    ttl: number
  ): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const pipeline = [];
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        // Add key to tag group
        pipeline.push(this.redisService.client.sAdd(tagKey, key));
        // Set expiration on the tag group
        pipeline.push(this.redisService.client.expire(tagKey, ttl));
      }
      
      await Promise.all(pipeline);
    } catch (error) {
      logger.error('Failed to add to tag groups:', error);
    }
  }

  /**
   * Invalidate all keys with a specific tag
   */
  private async invalidateByTag(tag: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const tagKey = `tag:${tag}`;
      // Get all keys in the tag group
      const keys = await this.redisService.client.sMembers(tagKey);
      
      if (keys.length > 0) {
        // Delete all keys in the tag group
        await this.redisService.client.del(...keys);
        // Delete the tag group itself
        await this.redisService.client.del(tagKey);
        
        logger.debug(`Invalidated ${keys.length} keys with tag: ${tag}`);
      }
    } catch (error) {
      logger.error(`Failed to invalidate tag ${tag}:`, error);
    }
  }

  /**
   * Clear the entire cache (use with caution!)
   */
  public async clearAll(): Promise<void> {
    if (!this.enabled) return;
    
    try {
      await this.redisService.client.flushDb();
      logger.warn('Cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<{
    enabled: boolean;
    keys: number;
    memory: Record<string, any>;
    info: Record<string, string>;
  }> {
    if (!this.enabled) {
      return {
        enabled: false,
        keys: 0,
        memory: {},
        info: {},
      };
    }

    try {
      const [keys, memory, info] = await Promise.all([
        this.redisService.client.dbSize(),
        this.redisService.client.info('memory'),
        this.redisService.client.info('server'),
      ]);

      // Parse memory info
      const memoryInfo: Record<string, any> = {};
      for (const line of memory.split('\r\n')) {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            memoryInfo[key.trim()] = isNaN(Number(value)) ? value : Number(value);
          }
        }
      }

      // Parse server info
      const serverInfo: Record<string, string> = {};
      for (const line of info.split('\r\n')) {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            serverInfo[key.trim()] = value.trim();
          }
        }
      }

      return {
        enabled: true,
        keys,
        memory: memoryInfo,
        info: serverInfo,
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const cacheOptimizer = new CacheOptimizer(RedisService.getInstance());

// Example usage:
/*
// Basic usage
const user = await cacheOptimizer.withCache(
  ['user', userId],
  () => prisma.user.findUnique({ where: { id: userId } }),
  { ttl: 3600, tags: [`user:${userId}`] }
);

// Invalidate by tag
await cacheOptimizer.invalidate('tag:user:123');

// Invalidate by key pattern
await cacheOptimizer.invalidate('user:profile:*');

// Get cache stats
const stats = await cacheOptimizer.getStats();
*/
