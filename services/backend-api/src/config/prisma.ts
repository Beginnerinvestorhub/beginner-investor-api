import { PrismaClient } from '@prisma/client';
// Import the Firebase Admin SDK configuration (auth) but only use it for external checks
import { auth } from './firebase-admin';

// 1. Create a global variable for the PrismaClient instance.
// This prevents multiple instances in development, which can lead to connection exhaustion.
// We use a global object property or a shared variable across environment.
// The `globalThis` approach is a standard pattern for singletons in Next.js/Node.js environments.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// 2. Initialize the client, reusing the global one if it exists.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Optional: Add logging to see queries in development
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// 3. In development, attach the instance to the global object.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * ⚠️ IMPORTANT: This function is for a manual health check or test script,
 * NOT for the main application initialization.
 * The application should import and use the exported `prisma` instance directly.
 */
export async function runHealthCheck() {
  console.log('Starting application health check...');

  // 1. Test Database Connection
  try {
    // The $queryRaw function is a lighter way to test the connection than $connect()
    await prisma.$queryRaw`SELECT 1`; 
    console.log('✅ Database connection (Prisma) successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }

  // 2. Test Firebase Admin SDK
  try {
    // This assumes `auth` is already configured in './firebase-admin'
    // This will verify service account credentials and network access to Firebase.
    await auth.listUsers(1); 
    console.log('✅ Firebase Admin SDK connection successful');
  } catch (error) {
    console.error('❌ Firebase Admin SDK connection failed:', error);
  }

  // NOTE: We do NOT disconnect here. The exported 'prisma' client should remain connected
  // throughout the application's lifecycle, managed by the pool.
}

// Optional: Execute the health check only when running this file directly
if (require.main === module) {
  runHealthCheck().catch((e) => {
    console.error("Health check failed unexpectedly:", e);
    process.exit(1);
  });
}