/**
 * Global test setup for Jest
 * Runs once before all test suites
 */

// Environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test-db';

// Disable external services for testing
process.env.REDIS_URL = 'redis://localhost:6379/15';
process.env.FIREBASE_PROJECT_ID = 'test-project';

// Set test-specific configuration
process.env.LOG_LEVEL = 'error';

// Global test utilities
global.testUtils = {
  // Helper function to create test users
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }),

  // Helper function to create test data
  createTestData: (type = 'default') => {
    switch (type) {
      case 'user':
        return {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        };
      case 'portfolio':
        return {
          name: 'Test Portfolio',
          initialValue: 10000,
          riskTolerance: 'moderate',
        };
      default:
        return {
          id: 'test-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
    }
  },

  // Helper function to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

console.log('✅ Global test setup completed');
