import { createClient, RedisClientType } from 'redis';

export interface RedisManager {
  getClient(): RedisClientType;
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

class SharedRedisManager implements RedisManager {
  private static instance: SharedRedisManager;
  private client: RedisClientType | null = null;
  private isConnectedFlag = false;

  private constructor() {
    this.initializeClient();
  }

  public static getInstance(): SharedRedisManager {
    if (!SharedRedisManager.instance) {
      SharedRedisManager.instance = new SharedRedisManager();
    }
    return SharedRedisManager.instance;
  }

  private initializeClient(): void {
    // Get Redis URL from environment variables
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 5) {
            console.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.isConnectedFlag = true;
      console.log('Shared Redis client connected');
    });

    this.client.on('error', (err: Error) => {
      console.error('Shared Redis client error:', err);
      this.isConnectedFlag = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Reconnecting to shared Redis...');
    });

    this.client.on('end', () => {
      this.isConnectedFlag = false;
      console.log('Shared Redis client connection closed');
    });
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  public isConnected(): boolean {
    return this.isConnectedFlag;
  }

  public async connect(): Promise<void> {
    if (!this.client) {
      this.initializeClient();
    }

    if (!this.isConnectedFlag) {
      try {
        await this.client!.connect();
      } catch (error) {
        console.error('Failed to connect to shared Redis:', error);
        throw error;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client && this.isConnectedFlag) {
      try {
        await this.client.quit();
      } catch (error) {
        console.error('Error disconnecting from shared Redis:', error);
        throw error;
      }
    }
  }
}

// Export singleton instance
export const redisManager = SharedRedisManager.getInstance();

// Initialize connection on module load
(async () => {
  try {
    await redisManager.connect();
    console.log('Shared Redis manager initialized');
  } catch (error) {
    console.error('Failed to initialize shared Redis manager:', error);
  }
})();
