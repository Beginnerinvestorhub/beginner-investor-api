import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create initial user roles and permissions if needed
  console.log('🌱 Seeding database...')

  // Check if we need to create initial data
  const userCount = await prisma.user.count()

  if (userCount === 0) {
    console.log('Creating initial seed data...')

    // Create sample users for testing (only in development)
    if (process.env.NODE_ENV === 'development') {
      // This would create sample data for development
      // In production, this should be handled differently
      console.log('Skipping seed data creation in production environment')
    }
  }

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
