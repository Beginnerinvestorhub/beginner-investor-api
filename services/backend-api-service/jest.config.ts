import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  
  // Enhanced coverage thresholds by directory
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher standards for critical paths
    './src/controllers/': {
      branches: 85,
      functions: 90,
      lines: 85,
      statements: 85,
    },
    './src/services/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/middleware/': {
      branches: 85,
      functions: 90,
      lines: 85,
      statements: 85,
    },
  },
  
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
  },
  
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/docs/',
  ],
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/docs/**',
    '!src/scripts/**',
    '!src/types/**', // Exclude type-only files
  ],
  
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  
  // Different timeouts for different test types
  testTimeout: 10000,
  
  // Global test setup
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
  
  // Enhanced error handling
  errorOnDeprecated: true,
  
  // Improved performance
  maxWorkers: '50%',
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Improved console output
  silent: false,
  
  // Test result processor for CI
  testResultsProcessor: process.env.CI ? 'jest-sonar-reporter' : undefined,
  
  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

export default config;