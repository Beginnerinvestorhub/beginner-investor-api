import { RedisService } from '../../services/redis/redis.service';
import { createClient, RedisClientType } from 'redis';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock the Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(),
  RedisClientType: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  })),
}));

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedisClient: DeepMockProxy<RedisClientType>;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockRedisClient = mockDeep<RedisClientType>();
    (createClient as jest.Mock).mockReturnValue(mockRedisClient);
    
    // Create a new instance of the service for each test
    redisService = RedisService.getInstance();
  });

  afterEach(() => {
    // Reset the singleton instance
    (RedisService as any).instance = null;
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = RedisService.getInstance();
      const instance2 = RedisService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('connect', () => {
    it('should connect to Redis', async () => {
      await redisService.connect();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should not connect if already connected', async () => {
      (redisService as any).isConnected = true;
      await redisService.connect();
      expect(mockRedisClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Redis', async () => {
      (redisService as any).isConnected = true;
      await redisService.disconnect();
      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect if not connected', async () => {
      await redisService.disconnect();
      expect(mockRedisClient.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a value from Redis', async () => {
      const testKey = 'test:key';
      const testValue = JSON.stringify({ foo: 'bar' });
      
      mockRedisClient.get.mockResolvedValue(testValue);
      
      const result = await redisService.get(testKey);
      
      expect(mockRedisClient.get).toHaveBeenCalledWith(testKey);
      expect(result).toEqual(JSON.parse(testValue));
    });

    it('should return null for non-existent key', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      
      const result = await redisService.get('nonexistent:key');
      
      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors', async () => {
      const testKey = 'test:key';
      const invalidJson = '{invalid: json}';
      
      mockRedisClient.get.mockResolvedValue(invalidJson);
      
      const result = await redisService.get(testKey);
      
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set a value in Redis', async () => {
      const testKey = 'test:key';
      const testValue = { foo: 'bar' };
      const ttl = 60;
      
      mockRedisClient.set.mockResolvedValue('OK');
      
      const result = await redisService.set(testKey, testValue, ttl);
      
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(testValue),
        { EX: ttl }
      );
      expect(result).toBe(true);
    });

    it('should set a value without TTL', async () => {
      const testKey = 'test:key';
      const testValue = { foo: 'bar' };
      
      mockRedisClient.set.mockResolvedValue('OK');
      
      const result = await redisService.set(testKey, testValue);
      
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(testValue),
        {}
      );
      expect(result).toBe(true);
    });

    it('should handle set errors', async () => {
      const testKey = 'test:key';
      const testValue = { foo: 'bar' };
      
      mockRedisClient.set.mockRejectedValue(new Error('Redis error'));
      
      const result = await redisService.set(testKey, testValue);
      
      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    it('should delete a key from Redis', async () => {
      const testKey = 'test:key';
      
      mockRedisClient.del.mockResolvedValue(1);
      
      const result = await redisService.del(testKey);
      
      expect(mockRedisClient.del).toHaveBeenCalledWith(testKey);
      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      const testKey = 'nonexistent:key';
      
      mockRedisClient.del.mockResolvedValue(0);
      
      const result = await redisService.del(testKey);
      
      expect(result).toBe(false);
    });
  });

  describe('pipeline', () => {
    it('should execute a pipeline of operations', async () => {
      const operations = [
        { type: 'set' as const, key: 'key1', value: 'value1' },
        { type: 'get' as const, key: 'key2' },
        { type: 'del' as const, key: 'key3' },
      ];
      
      mockRedisClient.multi.mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue(['OK', 'value2', 1]);
      (redisService as any).client = {
        ...mockRedisClient,
        multi: () => ({
          set: jest.fn().mockReturnThis(),
          get: jest.fn().mockReturnThis(),
          del: jest.fn().mockReturnThis(),
          exec: mockExec,
        }),
      };
      
      const results = await (redisService as any).pipeline(operations);
      
      expect(mockExec).toHaveBeenCalled();
      expect(results).toEqual(['OK', 'value2', 1]);
    });

    it('should handle pipeline errors', async () => {
      const operations = [
        { type: 'set' as const, key: 'key1', value: 'value1' },
      ];
      
      (redisService as any).client = {
        ...mockRedisClient,
        multi: () => ({
          set: jest.fn().mockReturnThis(),
          exec: jest.fn().mockRejectedValue(new Error('Pipeline failed')),
        }),
      };
      
      await expect((redisService as any).pipeline(operations)).rejects.toThrow('Pipeline failed');
    });
  });

  describe('healthCheck', () => {
    it('should return true if Redis is healthy', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');
      
      const result = await (redisService as any).healthCheck();
      
      expect(result).toBe(true);
    });

    it('should return false if Redis is not healthy', async () => {
      mockRedisClient.ping.mockRejectedValue(new Error('Connection failed'));
      
      const result = await (redisService as any).healthCheck();
      
      expect(result).toBe(false);
    });
  });
});
