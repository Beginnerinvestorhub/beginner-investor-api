"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProactiveRefreshStrategy = exports.CacheStampedeStrategy = exports.DistributedLock = exports.WriteBehindStrategy = exports.WriteThroughStrategy = exports.CacheAsideStrategy = void 0;
const redis_client_1 = require("./redis-client");
/**
 * Cache-aside (Lazy Loading) Strategy
 * Read from cache, if miss then read from DB and populate cache
 */
class CacheAsideStrategy {
    constructor(cacheManager, key, fetcher, options) {
        this.cacheManager = cacheManager;
        this.key = key;
        this.fetcher = fetcher;
        this.options = options;
    }
    async get() {
        return await this.cacheManager.getOrSet(this.key, this.fetcher, this.options);
    }
    async invalidate() {
        await this.cacheManager.delete(this.key, this.options);
    }
    async refresh() {
        await this.invalidate();
        return await this.get();
    }
}
exports.CacheAsideStrategy = CacheAsideStrategy;
/**
 * Write-through Strategy
 * Write to cache and DB simultaneously
 */
class WriteThroughStrategy {
    constructor(cacheManager, key, writer, options) {
        this.cacheManager = cacheManager;
        this.key = key;
        this.writer = writer;
        this.options = options;
    }
    async write(data) {
        // Write to both cache and database
        await Promise.all([
            this.cacheManager.set(this.key, data, this.options),
            this.writer(data)
        ]);
    }
    async read() {
        return await this.cacheManager.get(this.key, this.options);
    }
}
exports.WriteThroughStrategy = WriteThroughStrategy;
/**
 * Write-behind (Write-back) Strategy
 * Write to cache immediately, write to DB asynchronously
 */
class WriteBehindStrategy {
    constructor(cacheManager, key, writer, options, flushIntervalMs = 5000) {
        this.cacheManager = cacheManager;
        this.key = key;
        this.writer = writer;
        this.options = options;
        this.flushIntervalMs = flushIntervalMs;
        this.writeQueue = new Map();
        this.flushInterval = null;
        this.startFlushInterval();
    }
    async write(data) {
        // Write to cache immediately
        await this.cacheManager.set(this.key, data, this.options);
        // Queue for async DB write
        this.writeQueue.set(this.key, data);
    }
    startFlushInterval() {
        this.flushInterval = setInterval(async () => {
            await this.flush();
        }, this.flushIntervalMs);
    }
    async flush() {
        const entries = Array.from(this.writeQueue.entries());
        this.writeQueue.clear();
        await Promise.all(entries.map(([_, data]) => this.writer(data)));
    }
    async read() {
        return await this.cacheManager.get(this.key, this.options);
    }
    stop() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
    }
}
exports.WriteBehindStrategy = WriteBehindStrategy;
/**
 * Distributed Lock for preventing cache stampede
 */
class DistributedLock {
    constructor(key, ttl = 10 // Lock TTL in seconds
    ) {
        this.key = key;
        this.ttl = ttl;
        this.redis = redis_client_1.RedisClient.getInstance();
    }
    async acquire() {
        const lockKey = `lock:${this.key}`;
        const result = await this.redis.set(lockKey, '1', 'EX', this.ttl, 'NX');
        return result === 'OK';
    }
    async release() {
        const lockKey = `lock:${this.key}`;
        await this.redis.del(lockKey);
    }
    async withLock(fn) {
        const acquired = await this.acquire();
        if (!acquired) {
            throw new Error(`Failed to acquire lock for ${this.key}`);
        }
        try {
            return await fn();
        }
        finally {
            await this.release();
        }
    }
}
exports.DistributedLock = DistributedLock;
/**
 * Cache Stampede Prevention Strategy
 * Uses distributed locking to prevent multiple simultaneous cache misses
 */
class CacheStampedeStrategy {
    constructor(cacheManager, key, fetcher, options) {
        this.cacheManager = cacheManager;
        this.key = key;
        this.fetcher = fetcher;
        this.options = options;
    }
    async get() {
        // Try to get from cache
        const cached = await this.cacheManager.get(this.key, this.options);
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
                const retryCache = await this.cacheManager.get(this.key, this.options);
                if (retryCache !== null) {
                    return retryCache;
                }
                // Fallback: fetch anyway if still not in cache
            }
            // Fetch and populate cache
            const fresh = await this.fetcher();
            await this.cacheManager.set(this.key, fresh, this.options);
            return fresh;
        }
        finally {
            await lock.release();
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.CacheStampedeStrategy = CacheStampedeStrategy;
/**
 * Time-based Refresh Strategy
 * Proactively refreshes cache before expiration
 */
class ProactiveRefreshStrategy {
    constructor(cacheManager, key, fetcher, refreshIntervalMs, options) {
        this.cacheManager = cacheManager;
        this.key = key;
        this.fetcher = fetcher;
        this.refreshIntervalMs = refreshIntervalMs;
        this.options = options;
        this.refreshTimer = null;
    }
    start() {
        this.refreshTimer = setInterval(async () => {
            await this.refresh();
        }, this.refreshIntervalMs);
        // Initial fetch
        this.refresh();
    }
    async refresh() {
        try {
            const fresh = await this.fetcher();
            await this.cacheManager.set(this.key, fresh, this.options);
        }
        catch (error) {
            console.error(`Failed to refresh cache for key ${this.key}:`, error);
        }
    }
    stop() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    async get() {
        return await this.cacheManager.get(this.key, this.options);
    }
}
exports.ProactiveRefreshStrategy = ProactiveRefreshStrategy;
exports.default = {
    CacheAsideStrategy,
    WriteThroughStrategy,
    WriteBehindStrategy,
    DistributedLock,
    CacheStampedeStrategy,
    ProactiveRefreshStrategy,
};
