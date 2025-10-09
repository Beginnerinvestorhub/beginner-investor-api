"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.rateLimiter = exports.RateLimiter = void 0;
const cache_manager_1 = require("./cache-manager");
const cache_keys_1 = require("./cache-keys");
class RateLimiter {
    constructor() {
        this.cacheManager = new cache_manager_1.CacheManager();
    }
    async check(req, options) {
        const key = options.keyGenerator
            ? options.keyGenerator(req)
            : this.defaultKeyGenerator(req);
        const now = Date.now();
        const windowStart = now - options.windowMs;
        const cacheKey = cache_keys_1.CacheKeys.rateLimit.user(key, 'requests');
        try {
            // Get current request count for this window
            const requests = await this.cacheManager.get(cacheKey) || [];
            // Filter requests within the current window
            const validRequests = requests.filter(timestamp => timestamp > windowStart);
            if (validRequests.length >= options.maxRequests) {
                return {
                    success: false,
                    limit: options.maxRequests,
                    remaining: 0,
                    resetTime: validRequests[0] + options.windowMs
                };
            }
            // Add current request
            validRequests.push(now);
            // Update cache with new request count
            await this.cacheManager.set(cacheKey, validRequests, {
                ttl: Math.ceil(options.windowMs / 1000)
            });
            return {
                success: true,
                limit: options.maxRequests,
                remaining: options.maxRequests - validRequests.length,
                resetTime: validRequests[0] + options.windowMs
            };
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            // Fallback: allow request if Redis is down
            return {
                success: true,
                limit: options.maxRequests,
                remaining: options.maxRequests - 1,
                resetTime: now + options.windowMs
            };
        }
    }
    defaultKeyGenerator(req) {
        // Use IP address as default key
        return req.ip || req.connection?.remoteAddress || 'unknown';
    }
    // Middleware factory for Express.js
    createMiddleware(options) {
        return async (req, res, next) => {
            const result = await this.check(req, options);
            res.set({
                'X-RateLimit-Limit': result.limit,
                'X-RateLimit-Remaining': result.remaining,
                'X-RateLimit-Reset': result.resetTime
            });
            if (!result.success) {
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
                });
            }
            next();
        };
    }
}
exports.RateLimiter = RateLimiter;
// Global rate limiter instance
exports.rateLimiter = new RateLimiter();
// Predefined rate limit configurations
exports.RATE_LIMITS = {
    API: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
    },
    AUTH: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5
    },
    MARKET_DATA: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30
    },
    AI_ENGINE: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10
    }
};
