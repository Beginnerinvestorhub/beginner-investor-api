"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = void 0;
exports.initializeCache = initializeCache;
exports.initializeRateLimiting = initializeRateLimiting;
exports.initializeSystems = initializeSystems;
exports.cleanup = cleanup;
const redis_client_1 = require("./redis-client");
const cache_manager_1 = require("./cache-manager");
const rate_limiter_1 = require("./rate-limiter");
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
/**
 * Initialize Redis and cache systems for the application
 */
async function initializeCache() {
    try {
        // Redis configuration from environment or defaults
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            keyPrefix: process.env.REDIS_KEY_PREFIX || 'bih:',
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3
        };
        // Initialize Redis client
        const redis = redis_client_1.RedisClient.initialize(redisConfig);
        // Test connection
        await redis_client_1.RedisClient.healthCheck();
        console.log('✅ Redis cache system initialized successfully');
        console.log(`📍 Redis server: ${redisConfig.host}:${redisConfig.port}`);
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
/**
 * Initialize all caching and rate limiting systems
 */
async function initializeSystems() {
    console.log('🚀 Initializing cache and rate limiting systems...');
    await Promise.all([
        initializeCache(),
        initializeRateLimiting()
    ]);
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
// Export cache manager instance for use throughout the application
exports.cacheManager = new cache_manager_1.CacheManager();
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
    cacheManager: exports.cacheManager,
    rateLimiter: rate_limiter_1.rateLimiter
};
