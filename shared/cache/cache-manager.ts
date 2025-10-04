// shared/cache/cache-manager.ts
import { RedisClient } from './redis-client';
import type { Redis } from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

export class CacheManager {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour default

  constructor(defaultTTL?: number) {
    this.redis = RedisClient.getInstance();
    if (defaultTTL) {
      this.defaultTTL = defaultTTL;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const ttl = options?.ttl ?? this.defaultTTL;
      const serialized = JSON.stringify(value);
      
      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }
    } catch (error) {
      console.error(`Failed to set cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const cached = await this.redis.get(fullKey);
      
      if (!cached) return null;
      
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      await this.redis.del(fullKey);
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check existence of cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set multiple keys at once
   */
  async setMany<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
    options?: CacheOptions
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const entry of entries) {
      const fullKey = this.buildKey(entry.key, options?.namespace);
      const serialized = JSON.stringify(entry.value);
      const ttl = entry.ttl ?? options?.ttl ?? this.defaultTTL;
      
      if (ttl > 0) {
        pipeline.setex(fullKey, ttl, serialized);
      } else {
        pipeline.set(fullKey, serialized);
      }
    }
    
    await pipeline.exec();
  }

  /**
   * Get multiple keys at once
   */
  async getMany<T>(keys: string[], options?: CacheOptions): Promise<Map<string, T>> {
    const fullKeys = keys.map(k => this.buildKey(k, options?.namespace));
    const results = await this.redis.mget(...fullKeys);
    
    const map = new Map<string, T>();
    
    results.forEach((result, idx) => {
      if (result) {
        try {
          map.set(keys[idx], JSON.parse(result) as T);
        } catch (error) {
          console.error(`Failed to parse cached value for key ${keys[idx]}:`, error);
        }
      }
    });
    
    return map;
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string, options?: CacheOptions): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, options?.namespace);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length === 0) return 0;
      
      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Failed to delete keys matching pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }
    
    const fresh = await fetcher();
    await this.set(key, fresh, options);
    return fresh;
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, by: number = 1, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.namespace);
    return await this.redis.incrby(fullKey, by);
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, by: number = 1, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.namespace);
    return await this.redis.decrby(fullKey, by);
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.buildKey(key, options?.namespace);
    const result = await this.redis.expire(fullKey, seconds);
    return result === 1;
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.namespace);
    return await this.redis.ttl(fullKey);
  }

  /**
   * Build full cache key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Flush all keys in the current database
   */
  async flushAll(): Promise<void> {
    await this.redis.flushdb();
  }
}

export default CacheManager;
