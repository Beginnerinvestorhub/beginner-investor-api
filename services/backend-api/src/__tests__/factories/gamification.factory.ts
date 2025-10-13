// /test/factories/gamificationFactories.ts
import { faker } from "faker-js/faker";
import {
  Badge,
  BadgeType,
  PointTransaction,
  PointTransactionType,
  Streak,
  UserProgress,
} from "@prisma/client";

// Base factory for shared fields
const baseEntity = () => ({
  id: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Badge factory
export const createBadge = (overrides: Partial<Badge> = {}): Badge => ({
  ...baseEntity(),
  userId: faker.string.uuid(),
  type: BadgeType.BEGINNER,
  awardedAt: new Date(),
  metadata: {},
  ...overrides,
});

// PointTransaction factory
export const createPointTransaction = (
  overrides: Partial<PointTransaction> = {},
): PointTransaction => ({
  ...baseEntity(),
  userId: faker.string.uuid(),
  amount: faker.number.int({ min: 10, max: 100 }),
  type: PointTransactionType.LEARNING,
  description: faker.lorem.sentence(),
  metadata: {},
  expiresAt: faker.date.future(),
  ...overrides,
});

// Streak factory
export const createStreak = (overrides: Partial<Streak> = {}): Streak => ({
  ...baseEntity(),
  userId: faker.string.uuid(),
  currentStreak: faker.number.int({ min: 1, max: 30 }),
  longestStreak: faker.number.int({ min: 1, max: 100 }),
  lastActivityDate: new Date(),
  ...overrides,
});

// UserProgress factory
export const createUserProgress = (
  overrides: Partial<UserProgress> = {},
): UserProgress => ({
  ...baseEntity(),
  userId: faker.string.uuid(),
  level: faker.number.int({ min: 1, max: 100 }),
  experience: faker.number.int({ min: 0, max: 1000 }),
  totalPoints: faker.number.int({ min: 100, max: 10000 }),
  rank: faker.number.int({ min: 1, max: 1000 }),
  lastActivityAt: new Date(),
  ...overrides,
});

// Prisma Mocks
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
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  streak: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userProgress: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// Reset helper
export const resetMockPrismaGamification = () => {
  Object.values(mockPrismaGamificationResponses).forEach((model) =>
    Object.values(model).forEach((fn) => fn.mockReset()),
  );
};
