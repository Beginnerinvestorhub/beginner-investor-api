// shared/cache/redis-client.ts
import Redis from 'ioredis';

interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void;
  maxRetriesPerRequest?: number;
}

class RedisClient {
  private static instance: Redis | null = null;
  private static config: RedisConfig = {};

  static initialize(config: RedisConfig): Redis {
    if (this.instance) {
      console.warn('Redis client already initialized. Returning existing instance.');
      return this.instance;
    }

    this.config = config;

    try {
      if (config.url) {
        this.instance = new Redis(config.url, {
          keyPrefix: config.keyPrefix || 'bih:',
          retryStrategy: config.retryStrategy || this.defaultRetryStrategy,
          maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
        });
      } else {
        this.instance = new Redis({
          host: config.host || 'localhost',
          port: config.port || 6379,
          password: config.password,
          db: config.db || 0,
          keyPrefix: config.keyPrefix || 'bih:',
          retryStrategy: config.retryStrategy || this.defaultRetryStrategy,
          maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
        });
      }

      this.setupEventHandlers();
      console.log('✅ Redis client initialized successfully');
      return this.instance;
    } catch (error) {
      console.error('❌ Failed to initialize Redis client:', error);
      throw error;
    }
  }

  static getInstance(): Redis {
    if (!this.instance) {
      throw new Error('Redis client not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  private static defaultRetryStrategy(times: number): number | void {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }

  private static setupEventHandlers(): void {
    if (!this.instance) return;

    this.instance.on('connect', () => {
      console.log('🔌 Redis client connected');
    });

    this.instance.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    this.instance.on('error', (err: Error) => {
      console.error('❌ Redis client error:', err);
    });

    this.instance.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    this.instance.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
      this.instance = null;
      console.log('👋 Redis client disconnected');
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      if (!this.instance) return false;
      await this.instance.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export { RedisClient, RedisConfig };
