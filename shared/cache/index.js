"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheUtils = exports.cacheService = void 0;
const redis_1 = require("../redis");
const logger_1 = require("../utils/logger");
// Cache key generators for different types of data
const cacheKeys = {
    // Market Data
    marketPrice: (symbol) => `market:price:${symbol.toLowerCase()}`,
    marketIndicators: (timeframe) => `market:indicators:${timeframe}`,
    // AI Service
    aiResponse: (promptHash, model = 'gpt-4') => `ai:response:${model}:${promptHash}`,
    openaiRateLimit: (userId) => `rate_limit:openai:${userId}`,
    userBehavior: (userId, patternType) => `user:behavior:${userId}:${patternType}`,
    // Risk Engine
    riskCalculation: (portfolioHash, timeframe) => `risk:calc:${portfolioHash}:${timeframe}`,
    modelCache: (modelType, params) => `model:${modelType}:${JSON.stringify(params)}`,
    correlationMatrix: (assets, period) => `correlation:${assets.sort().join(',')}:${period}`,
    // Portfolio Simulation
    simulation: (portfolioHash, params) => `simulation:${portfolioHash}:${JSON.stringify(params)}`,
    monteCarlo: (portfolio, iterations) => `sim:montecarlo:${portfolio}:${iterations}`,
    backtest: (strategy, period) => `sim:backtest:${strategy}:${period}`,
    // User Session
    userSession: (userId) => `session:${userId}`,
    apiResponse: (endpoint, userId) => `cache:api:${endpoint}:${userId}`,
    rateLimit: (userId) => `rate_limit:api:${userId}`,
};
class CacheService {
    constructor() {
        this.keys = cacheKeys;
    }
    /**
     * Get a value from cache
     */
    async get(key, options = {}) {
        if (options.bypass)
            return null;
        try {
            const fullKey = this.getFullKey(key, options.namespace);
            const value = await redis_1.redisManager.getClient().get(fullKey);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch (error) {
                logger_1.logger.error('Cache parse error:', { key, error });
                return null;
            }
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', { key, error });
            return null;
        }
    }
    /**
     * Set a value in cache
     */
    async set(key, value, options = {}) {
        if (options.bypass)
            return true;
        try {
            const fullKey = this.getFullKey(key, options.namespace);
            const serialized = JSON.stringify(value);
            if (options.ttl) {
                await redis_1.redisManager.getClient().setEx(fullKey, options.ttl, serialized);
            }
            else {
                await redis_1.redisManager.getClient().set(fullKey, serialized);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', { key, error });
            return false;
        }
    }
    /**
     * Delete a value from cache
     */
    async delete(key, namespace) {
        try {
            const fullKey = this.getFullKey(key, namespace);
            const result = await redis_1.redisManager.getClient().del(fullKey);
            return result > 0;
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', { key, error });
            return false;
        }
    }
    /**
     * Invalidate all cache entries matching a pattern
     */
    async invalidatePattern(pattern) {
        try {
            const keys = await redis_1.redisManager.getClient().keys(pattern);
            if (keys.length === 0)
                return 0;
            const deleted = await redis_1.redisManager.getClient().del(keys);
            return deleted;
        }
        catch (error) {
            logger_1.logger.error('Cache invalidation error:', { pattern, error });
            return 0;
        }
    }
    /**
     * Get a value from cache, or set it using the provided function if not found
     */
    async getOrSet(key, fn, options = {}) {
        const cached = await this.get(key, options);
        if (cached !== null) {
            this.trackCacheHit();
            return cached;
        }
        this.trackCacheMiss();
        const value = await fn();
        await this.set(key, value, options);
        return value;
    }
    /**
     * Generate a cache key with namespace
     */
    getFullKey(key, namespace) {
        return namespace ? `${namespace}:${key}` : key;
    }
    // Track cache hits and misses for monitoring
    trackCacheHit() {
        // Could be implemented to track cache performance
    }
    trackCacheMiss() {
        // Could be implemented to track cache performance
    }
}
// Export a singleton instance
exports.cacheService = new CacheService();
// Helper functions for specific cache operations
exports.cacheUtils = {
    // Market Data
    async getMarketPrice(symbol) {
        return exports.cacheService.get(cacheKeys.marketPrice(symbol));
    },
    async setMarketPrice(symbol, price) {
        return exports.cacheService.set(cacheKeys.marketPrice(symbol), price, { ttl: 300 });
    },
    // AI Service
    async getAIResponse(promptHash, model = 'gpt-4') {
        return exports.cacheService.get(cacheKeys.aiResponse(promptHash, model));
    },
    async setAIResponse(promptHash, response, model = 'gpt-4') {
        return exports.cacheService.set(cacheKeys.aiResponse(promptHash, model), response, { ttl: 3600 });
    },
    // Risk Engine
    async getRiskCalculation(portfolioHash, timeframe) {
        return exports.cacheService.get(cacheKeys.riskCalculation(portfolioHash, timeframe));
    },
    async setRiskCalculation(portfolioHash, timeframe, data) {
        return exports.cacheService.set(cacheKeys.riskCalculation(portfolioHash, timeframe), data, { ttl: 1800 });
    },
    // Portfolio Simulation
    async getSimulation(portfolioHash, params) {
        return exports.cacheService.get(cacheKeys.simulation(portfolioHash, params));
    },
    async setSimulation(portfolioHash, params, data) {
        return exports.cacheService.set(cacheKeys.simulation(portfolioHash, params), data, { ttl: 3600 });
    },
    // User Session
    async getUserSession(userId) {
        return exports.cacheService.get(cacheKeys.userSession(userId));
    },
    async setUserSession(userId, data) {
        return exports.cacheService.set(cacheKeys.userSession(userId), data, { ttl: 86400 }); // 24 hours
    },
    // Invalidate all cache for a user (e.g., on logout or profile update)
    async invalidateUserCache(userId) {
        const pattern = `*:${userId}:*`;
        return exports.cacheService.invalidatePattern(pattern);
    }
};
exports.default = exports.cacheService;
