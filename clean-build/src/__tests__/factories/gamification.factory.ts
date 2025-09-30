import { faker } from '@faker-js/faker';
import { 
  Badge, 
  BadgeType, 
  PointTransaction, 
  PointTransactionType, 
  Streak, 
  UserProgress 
} from '@prisma/client';

// Badge factory
export const createBadge = (overrides: Partial<Badge> = {}): Badge => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  type: BadgeType.BEGINNER,
  awardedAt: new Date(),
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Point Transaction factory
export const createPointTransaction = (overrides: Partial<PointTransaction> = {}): PointTransaction => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  amount: faker.number.int({ min: 10, max: 100 }),
  type: PointTransactionType.LEARNING,
  description: faker.lorem.sentence(),
  metadata: {},
  expiresAt: faker.date.future(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Streak factory
export const createStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  currentStreak: faker.number.int({ min: 1, max: 30 }),
  longestStreak: faker.number.int({ min: 1, max: 100 }),
  lastActivityDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// User Progress factory
export const createUserProgress = (overrides: Partial<UserProgress> = {}): UserProgress => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  level: faker.number.int({ min: 1, max: 100 }),
  experience: faker.number.int({ min: 0, max: 1000 }),
  totalPoints: faker.number.int({ min: 100, max: 10000 }),
  rank: faker.number.int({ min: 1, max: 1000 }),
  lastActivityAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock Prisma responses
export const mockPrismaGamificationResponses = {
  badge: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  pointTransaction: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  streak: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  userProgress: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
};
