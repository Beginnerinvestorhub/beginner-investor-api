import { PrismaClient } from '@prisma/client';
import { auth } from './firebase-admin';

const prisma = new PrismaClient();

async function testConnections() {
  console.log('Testing connections...');

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }

  // Test Firebase Admin
  try {
    await auth.listUsers(1);
    console.log('✅ Firebase Admin SDK connection successful');
  } catch (error) {
    console.error('❌ Firebase Admin SDK connection failed:', error);
  }

  // Test database schema
  try {
    await prisma.user.findFirst();
    console.log('✅ Database schema validation successful');
  } catch (error) {
    console.error('❌ Database schema validation failed:', error);
  }

  await prisma.$disconnect();
}

testConnections().catch(console.error);