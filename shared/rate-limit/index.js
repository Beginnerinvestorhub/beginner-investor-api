"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = exports.rateLimiter = void 0;
const redis_1 = require("../redis");
const logger_1 = require("../utils/logger");
const defaultConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyPrefix: 'rate_limit',
    message: 'Too many requests, please try again later.',
    statusCode: 429,
};
class RateLimiter {
    constructor(config) {
        /**
         * Create a rate limiter with custom configuration
         */
        this.createRateLimiter = (config) => {
            const limiter = new RateLimiter(config);
            return limiter.middleware();
        };
        // Default rate limiter (15 minutes, 100 requests)
        this.defaultRateLimiter = this.createRateLimiter({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            keyPrefix: 'api_rate_limit',
        });
        // Strict rate limiter (1 minute, 20 requests)
        this.strictRateLimiter = this.createRateLimiter({
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 20,
            keyPrefix: 'strict_rate_limit',
        });
        // Public API rate limiter (1 hour, 1000 requests)
        this.publicApiRateLimiter = this.createRateLimiter({
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 1000,
            keyPrefix: 'public_api_rate_limit',
        });
        // Service rate limiter (1 minute, 200 requests)
        this.serviceRateLimiter = this.createRateLimiter({
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 200,
            keyPrefix: 'service_rate_limit',
            skip: (req) => {
                // Skip rate limiting for internal service requests
                return req.headers['x-service-token'] === process.env.INTERNAL_SERVICE_SECRET;
            },
        });
        this.config = { ...defaultConfig, ...config };
    }
    static getInstance(config = defaultConfig) {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter(config);
        }
        return RateLimiter.instance;
    }
    /**
     * Get a unique key for the rate limit
     */
    getKey(req) {
        // Use IP address by default
        const identifier = req.ip || 'unknown';
        return `${this.config.keyPrefix}:${identifier}:${req.method}:${req.path}`;
    }
    /**
     * Middleware to handle rate limiting
     */
    middleware() {
        return async (req, res, next) => {
            try {
                // Skip rate limiting if configured
                if (this.config.skip?.(req)) {
                    return next();
                }
                const key = this.getKey(req);
                const now = Date.now();
                const windowStart = now - this.config.windowMs;
                // Get all requests in the current window
                const client = redis_1.redisManager.getClient();
                const requests = await client.zRangeByScore(key, windowStart, now, 'WITHSCORES');
                // Remove old requests
                await client.zRemRangeByScore(key, 0, windowStart - 1);
                // Check if rate limit is exceeded
                if (requests.length / 2 >= this.config.maxRequests) {
                    const retryAfter = Math.ceil((parseInt(requests[1]) + this.config.windowMs - now) / 1000);
                    res.setHeader('Retry-After', retryAfter);
                    res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
                    res.setHeader('X-RateLimit-Remaining', '0');
                    res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());
                    return res.status(this.config.statusCode).json({
                        error: 'Too Many Requests',
                        message: this.config.message,
                        retryAfter: `${retryAfter} seconds`,
                    });
                }
                // Add current request to the sorted set
                await client.zAdd(key, { score: now, value: now.toString() });
                // Set TTL for the key
                await client.expire(key, Math.ceil(this.config.windowMs / 1000));
                // Set response headers
                const remaining = Math.max(0, this.config.maxRequests - (requests.length / 2) - 1);
                res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
                res.setHeader('X-RateLimit-Remaining', remaining.toString());
                res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());
                next();
            }
            catch (error) {
                logger_1.logger.error('Rate limit error:', error);
                // In case of Redis failure, allow the request to proceed
                next();
            }
        };
    }
}
exports.RateLimiter = RateLimiter;
// Create a singleton instance
const rateLimiter = RateLimiter.getInstance();
exports.rateLimiter = rateLimiter;
exports.default = rateLimiter;
