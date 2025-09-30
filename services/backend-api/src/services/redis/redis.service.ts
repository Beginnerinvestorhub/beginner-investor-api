import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import { logger } from '../../utils/logger';
import { env } from '../../config/env.schema';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY_MS = 5000;

  private constructor() {
    const redisOptions: RedisClientOptions = {
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > this.MAX_RECONNECT_ATTEMPTS) {
            logger.error('Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, this.RECONNECT_DELAY_MS);
        },
      },
    };

    this.client = createClient(redisOptions) as RedisClientType;
    this.setupEventListeners();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('Redis client connected');
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      this.reconnectAttempts++;
      logger.info(`Reconnecting to Redis (attempt ${this.reconnectAttempts})...`);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis client connection closed');
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  // Basic cache operations
  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      await this.ensureConnected();
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client.set(key, serialized, { EX: ttlSeconds });
      } else {
        await this.client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureConnected();
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  // Cache with fallback pattern
  public async withCache<T>(
    key: string,
    fallback: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, execute fallback
      const result = await fallback();
      
      // Cache the result
      await this.set(key, result, ttlSeconds);
      
      return result;
    } catch (error) {
      logger.error(`Error in withCache for key ${key}:`, error);
      // If cache fails, still try to get data from fallback
      return fallback();
    }
  }

  // Cache invalidation by pattern
  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      await this.ensureConnected();
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const deleted = await this.client.del(keys);
      logger.info(`Invalidated ${deleted} keys matching pattern: ${pattern}`);
      return deleted;
    } catch (error) {
      logger.error(`Error invalidating pattern ${pattern}:`, error);
      return 0;
    }
  }

  // Atomic increment with TTL
  public async incrWithTTL(key: string, ttlSeconds: number): Promise<number> {
    try {
      await this.ensureConnected();
      const multi = this.client.multi();
      const result = await multi
        .incr(key)
        .expire(key, ttlSeconds, 'NX')
        .exec();
      
      return result ? (result[0] as number) : 0;
    } catch (error) {
      logger.error(`Error in incrWithTTL for key ${key}:`, error);
      throw error;
    }
  }

  // Pipeline multiple operations
  public async pipeline(
    operations: Array<{
      type: 'set' | 'get' | 'del';
      key: string;
      value?: any;
      ttl?: number;
    }>
  ): Promise<Array<any>> {
    try {
      await this.ensureConnected();
      const pipeline = this.client.multi();

      for (const op of operations) {
        switch (op.type) {
          case 'set':
            if (op.ttl) {
              pipeline.set(op.key, JSON.stringify(op.value), { EX: op.ttl });
            } else {
              pipeline.set(op.key, JSON.stringify(op.value));
            }
            break;
          case 'get':
            pipeline.get(op.key);
            break;
          case 'del':
            pipeline.del(op.key);
            break;
        }
      }

      const results = await pipeline.exec();
      return results || [];
    } catch (error) {
      logger.error('Error in pipeline operation:', error);
      throw error;
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnected();
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Helper to ensure connection
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }
}

// Export a singleton instance
export const redisService = RedisService.getInstance();

// Initialize connection on import
(async () => {
  try {
    await redisService.connect();
    logger.info('Redis service initialized');
  } catch (error) {
    logger.error('Failed to initialize Redis service:', error);
  }
})();
