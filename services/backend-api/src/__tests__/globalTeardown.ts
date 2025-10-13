/**
 * Global test teardown for Jest
 * Runs once after all test suites
 */

import { PrismaClient } from '@prisma/client';

// Clean up test database
async function cleanupDatabase() {
  const prisma = new PrismaClient();

  try {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });

    await prisma.portfolio.deleteMany({
      where: {
        name: {
          contains: 'Test',
        },
      },
    });

    // Add more cleanup for other models as needed
    // await prisma.transaction.deleteMany({...});
    // await prisma.badge.deleteMany({...});

  } catch (error) {
    console.warn('Warning: Could not clean up test database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Clean up any external resources
async function cleanupResources() {
  // Close any open connections
  // Redis cleanup is handled in setup.ts

  // Clean up temporary files if any
  // Add any other cleanup needed
}

export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  try {
    await Promise.all([
      cleanupDatabase(),
      cleanupResources(),
    ]);

    console.log('✅ Global test teardown completed');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw - allow tests to complete even if cleanup fails
  }
}
