import { RedisService } from "./redis/redis.service";

// The class is now exported correctly for other files to import via default export
export default abstract class BaseService {
  // Changed access modifier from protected to private for internal state
  private redisService: RedisService;

  // Kept protected as derived classes might want to access or override the default TTL
  protected cacheTtl: number;

  constructor(cacheTtl: number = 300) {
    // We can use a property initializer if RedisService is guaranteed to exist
    this.redisService = RedisService.getInstance();
    this.cacheTtl = cacheTtl;
  }

  /**
   * Retrieves data from Redis cache or executes a fetch function and caches the result.
   * Provides a silent fallback to the fetch function if Redis operation fails.
   * @template T The type of data being cached.
   * @param key The cache key.
   * @param fetchFn The function to call if data is not in cache.
   * @param ttl Time-to-live in seconds for the cache entry.
   * @returns A Promise that resolves to the data.
   */
  protected async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.cacheTtl,
  ): Promise<T> {
    try {
      // Try to get from cache
      // FIX: Added 'as T' to handle cases where the cached value might be implicitly of a different type
      const cached = await this.redisService.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch from source
      const data = await fetchFn();

      // Cache the result (no await needed if we want to return the data immediately)
      this.redisService.set(key, data, ttl).catch((err) => {
        console.error(`Error setting cache for key ${key}:`, err);
      });

      return data;
    } catch (error) {
      // If Redis fails or an unhandled error occurs, fall back to direct fetch
      console.error(`Cache/Fetch error for key ${key}:`, error);
      // Ensure the return is the result of the function call
      return fetchFn();
    }
  }

  /**
   * Invalidates one or more cache keys.
   * @param keys A single key string or an array of key strings to invalidate.
   */
  protected async invalidateCache(keys: string | string[]): Promise<void> {
    try {
      if (Array.isArray(keys)) {
        // We use Promise.all to delete multiple keys concurrently
        await Promise.all(keys.map((key) => this.redisService.del(key)));
      } else {
        await this.redisService.del(keys);
      }
    } catch (error) {
      // This is a common pattern for "fire and forget" cache operations
      console.error("Cache invalidation error:", error);
    }
  }

  /**
   * Generates a consistent, unique cache key from a prefix and arguments.
   * @param prefix The base string for the cache key (e.g., 'user:data').
   * @param args Any number of arguments to include in the key.
   * @returns A normalized cache key string.
   */
  protected generateCacheKey(prefix: string, ...args: any[]): string {
    const argsString = args
      .map((arg) => {
        if (typeof arg === "object" && arg !== null) {
          // Normalize object keys for consistent hashing across different call orders
          return JSON.stringify(arg, Object.keys(arg).sort());
        }
        return String(arg);
      })
      .join(":");

    // Ensure the entire key is lowercased for case-insensitive consistency
    return `${prefix}:${argsString}`.toLowerCase();
  }
}
