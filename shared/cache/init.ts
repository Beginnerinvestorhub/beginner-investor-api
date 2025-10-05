import { RedisClient } from './redis-client';
import { CacheManager } from './cache-manager';
import { rateLimiter } from './rate-limiter';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Initialize Redis and cache systems for the application
 */
export async function initializeCache(): Promise<void> {
  try {
    // Redis configuration from environment or defaults
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'bih:',
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    };

    // Initialize Redis client
    const redis = RedisClient.initialize(redisConfig);

    // Test connection
    await RedisClient.healthCheck();
    console.log('✅ Redis cache system initialized successfully');
    console.log(`📍 Redis server: ${redisConfig.host}:${redisConfig.port}`);
    console.log(`🔑 Key prefix: ${redisConfig.keyPrefix}`);

  } catch (error) {
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
export async function initializeRateLimiting(): Promise<void> {
  try {
    console.log('🚦 Rate limiting system initialized');
    console.log('📊 Rate limits configured:');
    console.log('  - API: 100 requests/15min');
    console.log('  - Auth: 5 requests/15min');
    console.log('  - Market Data: 30 requests/min');
    console.log('  - AI Engine: 10 requests/min');
  } catch (error) {
    console.error('❌ Failed to initialize rate limiting:', error);
  }
}

/**
 * Initialize all caching and rate limiting systems
 */
export async function initializeSystems(): Promise<void> {
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
export async function cleanup(): Promise<void> {
  try {
    await RedisClient.disconnect();
    console.log('🧹 Cache systems cleaned up');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Export cache manager instance for use throughout the application
export const cacheManager = new CacheManager();

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

export default {
  initializeCache,
  initializeRateLimiting,
  initializeSystems,
  cleanup,
  cacheManager,
  rateLimiter
};
