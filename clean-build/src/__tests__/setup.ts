import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PrismaClient } from '@prisma/client';
import { RedisService } from '../services/redis/redis.service';

// Mock Redis service
jest.mock('../services/redis/redis.service');

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Add other models as needed
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock Redis service methods
const mockRedisService = RedisService.getInstance() as jest.Mocked<RedisService>;

// Mock implementation for Redis service
mockRedisService.get.mockImplementation(async (key: string) => {
  // Return mock data based on key
  if (key.startsWith('user:')) {
    return JSON.stringify({ id: 'user1', name: 'Test User' });
  }
  return null;
});

mockRedisService.set.mockResolvedValue(true);
mockRedisService.del.mockResolvedValue(true);

// Mock MongoDB in-memory server for integration tests
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start MongoDB in-memory server
  mongoServer = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongoServer.getUri();
  
  // Initialize Redis service
  await mockRedisService.connect();
});

afterAll(async () => {
  // Stop MongoDB in-memory server
  await mongoServer.stop();
  
  // Disconnect Redis
  await mockRedisService.disconnect();
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(30000);

// Export mocks for use in tests
export { mockRedisService };
