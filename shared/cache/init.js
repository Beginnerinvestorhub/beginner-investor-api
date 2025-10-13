"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = void 0;
exports.initializeCache = initializeCache;
exports.initializeRateLimiting = initializeRateLimiting;
exports.initializeSystems = initializeSystems;
exports.cleanup = cleanup;
exports.getCacheManager = getCacheManager;
exports.getRateLimiter = getRateLimiter;
const redis_client_1 = require("./redis-client");
const cache_manager_1 = require("./cache-manager");
const rate_limiter_1 = require("./rate-limiter");
const _dotenv_1 = require(" dotenv");
// Load environment variables
(0, _dotenv_1.config)();
/**
 * Initialize Redis and cache systems for the application
 */
async function initializeCache() {
    try {
        // Redis configuration from environment or defaults
        const redisConfig = {
            keyPrefix: process.env.REDIS_KEY_PREFIX || 'bih:',
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3
        };
        // Use REDIS_URL if available, otherwise use individual config
        if (process.env.REDIS_URL) {
            redisConfig.url = process.env.REDIS_URL;
        }
        else {
            redisConfig.host = process.env.REDIS_HOST || 'localhost';
            redisConfig.port = parseInt(process.env.REDIS_PORT || '6379');
            redisConfig.password = process.env.REDIS_PASSWORD;
            redisConfig.db = parseInt(process.env.REDIS_DB || '0');
        }
        // Initialize Redis client
        await redis_client_1.RedisClient.initialize(redisConfig);
        // Test connection
        await redis_client_1.RedisClient.healthCheck();
        console.log('✅ Redis cache system initialized successfully');
        if (redisConfig.url) {
            console.log(`📍 Redis server: ${redisConfig.url}`);
        }
        else {
            console.log(`📍 Redis server: ${redisConfig.host}:${redisConfig.port}`);
        }
        console.log(`🔑 Key prefix: ${redisConfig.keyPrefix}`);
    }
    catch (error) {
        console.error('❌ Failed to initialize Redis cache system:', error);
        console.log('⚠️  Falling back to in-memory caching');
        // For development, we'll continue without Redis
        // In production, this should throw an error
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Redis is required in production environment');
        }
    }
}
/**
 * Initialize rate limiting system
 */
async function initializeRateLimiting() {
    try {
        console.log('🚦 Rate limiting system initialized');
        console.log('📊 Rate limits configured:');
        console.log('  - API: 100 requests/15min');
        console.log('  - Auth: 5 requests/15min');
        console.log('  - Market Data: 30 requests/min');
        console.log('  - AI Engine: 10 requests/min');
    }
    catch (error) {
        console.error('❌ Failed to initialize rate limiting:', error);
    }
}
// Global instances
let cacheManager = null;
let rateLimiter = null;
/**
 * Initialize all caching and rate limiting systems
 */
async function initializeSystems() {
    console.log('🚀 Initializing cache and rate limiting systems...');
    await Promise.all([
        initializeCache(),
        initializeRateLimiting()
    ]);
    // Instantiate after Redis is initialized
    cacheManager = new cache_manager_1.CacheManager();
    rateLimiter = new rate_limiter_1.RateLimiter();
    console.log('✅ All systems initialized successfully');
}
/**
 * Cleanup function to be called on application shutdown
 */
async function cleanup() {
    try {
        await redis_client_1.RedisClient.disconnect();
        console.log('🧹 Cache systems cleaned up');
    }
    catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}
/**
 * Get cache manager instance
 */
function getCacheManager() {
    if (!cacheManager) {
        throw new Error('Cache manager not initialized. Call initializeSystems() first.');
    }
    return cacheManager;
}
/**
 * Get rate limiter instance
 */
function getRateLimiter() {
    if (!rateLimiter) {
        throw new Error('Rate limiter not initialized. Call initializeSystems() first.');
    }
    return rateLimiter;
}
// Export types and configs
var rate_limiter_2 = require("./rate-limiter");
Object.defineProperty(exports, "RATE_LIMITS", { enumerable: true, get: function () { return rate_limiter_2.RATE_LIMITS; } });
// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await cleanup();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await cleanup();
    process.exit(0);
});
exports.default = {
    initializeCache,
    initializeRateLimiting,
    initializeSystems,
    cleanup,
    getCacheManager,
    getRateLimiter
};
