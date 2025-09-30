import { faker } from '@faker-js/faker';
import { User, UserRole } from '@prisma/client';

type UserFactoryOptions = Partial<User>;

export const createUser = (overrides: UserFactoryOptions = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: faker.internet.password(),
  role: UserRole.USER,
  avatarUrl: faker.image.avatar(),
  isEmailVerified: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createUserArray = (count: number, overrides: UserFactoryOptions = {}): User[] => {
  return Array.from({ length: count }, () => createUser(overrides));
};

// Mock Prisma user responses
export const mockPrismaUserResponses = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
