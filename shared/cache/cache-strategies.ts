// shared/cache/cache-strategies.ts
import { CacheManager, CacheOptions } from './cache-manager';
import { RedisClient } from './redis-client';

/**
 * Cache-aside (Lazy Loading) Strategy
 * Read from cache, if miss then read from DB and populate cache
 */
export class CacheAsideStrategy<T> {
  constructor(
    private cacheManager: CacheManager,
    private key: string,
    private fetcher: () => Promise<T>,
    private options?: CacheOptions
  ) {}

  async get(): Promise<T> {
    return await this.cacheManager.getOrSet(this.key, this.fetcher, this.options);
  }

  async invalidate(): Promise<void> {
    await this.cacheManager.delete(this.key, this.options);
  }

  async refresh(): Promise<T> {
    await this.invalidate();
    return await this.get();
  }
}

/**
 * Write-through Strategy
 * Write to cache and DB simultaneously
 */
export class WriteThroughStrategy<T> {
  constructor(
    private cacheManager: CacheManager,
    private key: string,
    private writer: (data: T) => Promise<void>,
    private options?: CacheOptions
  ) {}

  async write(data: T): Promise<void> {
    // Write to both cache and database
    await Promise.all([
      this.cacheManager.set(this.key, data, this.options),
      this.writer(data)
    ]);
  }

  async read(): Promise<T | null> {
    return await this.cacheManager.get<T>(this.key, this.options);
  }
}

/**
 * Write-behind (Write-back) Strategy
 * Write to cache immediately, write to DB asynchronously
 */
export class WriteBehindStrategy<T> {
  private writeQueue: Map<string, T> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(
    private cacheManager: CacheManager,
    private key: string,
    private writer: (data: T) => Promise<void>,
    private options?: CacheOptions,
    private flushIntervalMs: number = 5000
  ) {
    this.startFlushInterval();
  }

  async write(data: T): Promise<void> {
    // Write to cache immediately
    await this.cacheManager.set(this.key, data, this.options);
    
    // Queue for async DB write
    this.writeQueue.set(this.key, data);
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(async () => {
      await this.flush();
    }, this.flushIntervalMs);
  }

  async flush(): Promise<void> {
    const entries = Array.from(this.writeQueue.entries());
    this.writeQueue.clear();

    await Promise.all(
      entries.map(([_, data]) => this.writer(data))
    );
  }

  async read(): Promise<T | null> {
    return await this.cacheManager.get<T>(this.key, this.options);
  }

  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

/**
 * Distributed Lock for preventing cache stampede
 */
export class DistributedLock {
  private redis = RedisClient.getInstance();

  constructor(
    private key: string,
    private ttl: number = 10 // Lock TTL in seconds
  ) {}

  async acquire(): Promise<boolean> {
    const lockKey = `lock:${this.key}`;
    const result = await this.redis.set(lockKey, '1', 'EX', this.ttl, 'NX');
    return result === 'OK';
  }

  async release(): Promise<void> {
    const lockKey = `lock:${this.key}`;
    await this.redis.del(lockKey);
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const acquired = await this.acquire();
    
    if (!acquired) {
      throw new Error(`Failed to acquire lock for ${this.key}`);
    }

    try {
      return await fn();
    } finally {
      await this.release();
    }
  }
}

/**
 * Cache Stampede Prevention Strategy
 * Uses distributed locking to prevent multiple simultaneous cache misses
 */
export class CacheStampedeStrategy<T> {
  constructor(
    private cacheManager: CacheManager,
    private key: string,
    private fetcher: () => Promise<T>,
    private options?: CacheOptions
  ) {}

  async get(): Promise<T> {
    // Try to get from cache
    const cached = await this.cacheManager.get<T>(this.key, this.options);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - acquire lock
    const lock = new DistributedLock(this.key);
    
    try {
      const acquired = await lock.acquire();
      
      if (!acquired) {
        // Another process is fetching, wait and try to read from cache
        await this.sleep(100);
        const retryCache = await this.cacheManager.get<T>(this.key, this.options);
        if (retryCache !== null) {
          return retryCache;
        }
        // Fallback: fetch anyway if still not in cache
      }

      // Fetch and populate cache
      const fresh = await this.fetcher();
      await this.cacheManager.set(this.key, fresh, this.options);
      return fresh;
    } finally {
      await lock.release();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Time-based Refresh Strategy
 * Proactively refreshes cache before expiration
 */
export class ProactiveRefreshStrategy<T> {
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private cacheManager: CacheManager,
    private key: string,
    private fetcher: () => Promise<T>,
    private refreshIntervalMs: number,
    private options?: CacheOptions
  ) {}

  start(): void {
    this.refreshTimer = setInterval(async () => {
      await this.refresh();
    }, this.refreshIntervalMs);

    // Initial fetch
    this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const fresh = await this.fetcher();
      await this.cacheManager.set(this.key, fresh, this.options);
    } catch (error) {
      console.error(`Failed to refresh cache for key ${this.key}:`, error);
    }
  }

  stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async get(): Promise<T | null> {
    return await this.cacheManager.get<T>(this.key, this.options);
  }
}

export default {
  CacheAsideStrategy,
  WriteThroughStrategy,
  WriteBehindStrategy,
  DistributedLock,
  CacheStampedeStrategy,
  ProactiveRefreshStrategy,
};
