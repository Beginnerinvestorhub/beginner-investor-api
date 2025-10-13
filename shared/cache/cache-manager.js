"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
// shared/cache/cache-manager.ts
const redis_client_1 = require("./redis-client");
class CacheManager {
    redis;
    defaultTTL = 3600; // 1 hour default
    constructor(defaultTTL) {
        this.redis = redis_client_1.RedisClient.getInstance();
        if (defaultTTL) {
            this.defaultTTL = defaultTTL;
        }
    }
    /**
     * Set a value in cache
     */
    async set(key, value, options) {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const ttl = options?.ttl ?? this.defaultTTL;
            const serialized = JSON.stringify(value);
            if (ttl > 0) {
                await this.redis.setex(fullKey, ttl, serialized);
            }
            else {
                await this.redis.set(fullKey, serialized);
            }
        }
        catch (error) {
            console.error(`Failed to set cache key ${key}:`, error);
            throw error;
        }
    }
    /**
     * Get a value from cache
     */
    async get(key, options) {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const cached = await this.redis.get(fullKey);
            if (!cached)
                return null;
            return JSON.parse(cached);
        }
        catch (error) {
            console.error(`Failed to get cache key ${key}:`, error);
            return null;
        }
    }
    /**
     * Delete a key from cache
     */
    async delete(key, options) {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            await this.redis.del(fullKey);
        }
        catch (error) {
            console.error(`Failed to delete cache key ${key}:`, error);
            throw error;
        }
    }
    /**
     * Check if a key exists
     */
    async exists(key, options) {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const result = await this.redis.exists(fullKey);
            return result === 1;
        }
        catch (error) {
            console.error(`Failed to check existence of cache key ${key}:`, error);
            return false;
        }
    }
    /**
     * Set multiple keys at once
     */
    async setMany(entries, options) {
        const pipeline = this.redis.pipeline();
        for (const entry of entries) {
            const fullKey = this.buildKey(entry.key, options?.namespace);
            const serialized = JSON.stringify(entry.value);
            const ttl = entry.ttl ?? options?.ttl ?? this.defaultTTL;
            if (ttl > 0) {
                pipeline.setex(fullKey, ttl, serialized);
            }
            else {
                pipeline.set(fullKey, serialized);
            }
        }
        await pipeline.exec();
    }
    /**
     * Get multiple keys at once
     */
    async getMany(keys, options) {
        const fullKeys = keys.map(k => this.buildKey(k, options?.namespace));
        const results = await this.redis.mget(...fullKeys);
        const map = new Map();
        results.forEach((result, idx) => {
            if (result) {
                try {
                    map.set(keys[idx], JSON.parse(result));
                }
                catch (error) {
                    console.error(`Failed to parse cached value for key ${keys[idx]}:`, error);
                }
            }
        });
        return map;
    }
    /**
     * Delete all keys matching a pattern
     */
    async deletePattern(pattern, options) {
        try {
            const fullPattern = this.buildKey(pattern, options?.namespace);
            const keys = await this.redis.keys(fullPattern);
            if (keys.length === 0)
                return 0;
            await this.redis.del(...keys);
            return keys.length;
        }
        catch (error) {
            console.error(`Failed to delete keys matching pattern ${pattern}:`, error);
            throw error;
        }
    }
    /**
     * Get or set pattern - fetch from cache or compute and cache
     */
    async getOrSet(key, fetcher, options) {
        const cached = await this.get(key, options);
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
    async increment(key, by = 1, options) {
        const fullKey = this.buildKey(key, options?.namespace);
        return await this.redis.incrby(fullKey, by);
    }
    /**
     * Decrement a numeric value
     */
    async decrement(key, by = 1, options) {
        const fullKey = this.buildKey(key, options?.namespace);
        return await this.redis.decrby(fullKey, by);
    }
    /**
     * Set expiration on a key
     */
    async expire(key, seconds, options) {
        const fullKey = this.buildKey(key, options?.namespace);
        const result = await this.redis.expire(fullKey, seconds);
        return result === 1;
    }
    /**
     * Get TTL of a key
     */
    async ttl(key, options) {
        const fullKey = this.buildKey(key, options?.namespace);
        return await this.redis.ttl(fullKey);
    }
    /**
     * Build full cache key with namespace
     */
    buildKey(key, namespace) {
        return namespace ? `${namespace}:${key}` : key;
    }
    /**
     * Flush all keys in the current database
     */
    async flushAll() {
        await this.redis.flushdb();
    }
}
exports.CacheManager = CacheManager;
exports.default = CacheManager;
