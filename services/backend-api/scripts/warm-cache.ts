#!/usr/bin/env node

import { redisService } from '../src/services/redis/redis.service';
import { logger } from '../src/utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache TTLs (in seconds)
const CACHE_TTLS = {
  LEADERBOARD: 300, // 5 minutes
  DASHBOARD: 300,   // 5 minutes
  USER_PROFILES: 600, // 10 minutes
  APP_CONFIG: 3600,  // 1 hour
} as const;

/**
 * Warms the leaderboard cache
 */
async function warmLeaderboardCache() {
  const start = Date.now();
  const leaderboard = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      score: true,
      rank: true,
      avatarUrl: true,
    },
    orderBy: { score: 'desc' },
    take: 100,
  });

  await redisService.set('leaderboard:global', leaderboard, CACHE_TTLS.LEADERBOARD);
  
  const duration = Date.now() - start;
  logger.info(`Warmed leaderboard cache with ${leaderboard.length} entries (${duration}ms)`);
  return leaderboard.length;
}

/**
 * Warms user profile caches for active users
 */
async function warmUserProfilesCache() {
  const start = Date.now();
  const activeUsers = await prisma.user.findMany({
    where: { lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Last 30 days
    take: 1000,
  });

  const pipeline = [];
  for (const user of activeUsers) {
    pipeline.push({
      type: 'set' as const,
      key: `user:${user.id}:profile`,
      value: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        joinDate: user.createdAt,
        lastActive: user.lastActive,
      },
      ttl: CACHE_TTLS.USER_PROFILES,
    });
  }

  await redisService.pipeline(pipeline);
  
  const duration = Date.now() - start;
  logger.info(`Warmed ${activeUsers.length} user profiles (${duration}ms)`);
  return activeUsers.length;
}

/**
 * Warms dashboard data cache
 */
async function warmDashboardCache() {
  const start = Date.now();
  
  // Get dashboard statistics
  const [
    totalUsers,
    activeToday,
    totalInvestments,
    totalValueLocked,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { lastActive: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.portfolio.aggregate({ _sum: { balance: true } }),
    prisma.activityLog.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, username: true } } },
    }),
  ]);

  const dashboardData = {
    stats: {
      totalUsers,
      activeToday,
      totalInvestments: totalInvestments._sum.amount || 0,
      totalValueLocked: totalValueLocked._sum.balance || 0,
    },
    recentActivity,
    lastUpdated: new Date(),
  };

  await redisService.set('dashboard:overview', dashboardData, CACHE_TTLS.DASHBOARD);
  
  const duration = Date.now() - start;
  logger.info(`Warmed dashboard cache (${duration}ms)`);
  return dashboardData;
}

/**
 * Warms application configuration cache
 */
async function warmAppConfigCache() {
  const start = Date.now();
  
  const [appConfig, featureFlags, maintenanceMode] = await Promise.all([
    prisma.config.findMany({ where: { type: 'app' } }),
    prisma.featureFlag.findMany(),
    prisma.maintenanceMode.findFirst({
      where: { isActive: true },
      orderBy: { startedAt: 'desc' },
    }),
  ]);

  const configData = {
    app: appConfig.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
    features: featureFlags.reduce((acc, { name, isEnabled }) => ({ ...acc, [name]: isEnabled }), {}),
    maintenance: maintenanceMode,
    lastUpdated: new Date(),
  };

  await redisService.set('config:app', configData, CACHE_TTLS.APP_CONFIG);
  
  const duration = Date.now() - start;
  logger.info(`Warmed application config cache (${duration}ms)`);
  return configData;
}

/**
 * Main function to warm all caches
 */
async function warmAllCaches() {
  try {
    logger.info('Starting cache warming process...');
    
    // Run all cache warming in parallel
    const [leaderboardCount, userCount, dashboard, config] = await Promise.all([
      warmLeaderboardCache(),
      warmUserProfilesCache(),
      warmDashboardCache(),
      warmAppConfigCache(),
    ]);

    logger.info('Cache warming completed successfully');
    logger.info(`- Leaderboard: ${leaderboardCount} entries`);
    logger.info(`- User profiles: ${userCount} users`);
    logger.info(`- Dashboard data: ${Object.keys(dashboard.stats).length} metrics`);
    logger.info(`- App config: ${Object.keys(config.features).length} feature flags`);
    
    return {
      success: true,
      stats: {
        leaderboardCount,
        userCount,
        dashboardMetrics: Object.keys(dashboard.stats).length,
        featureFlags: Object.keys(config.features).length,
      },
    };
  } catch (error) {
    logger.error('Error warming caches:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    await prisma.$disconnect();
    await redisService.disconnect();
  }
}

// Run the cache warming if this file is executed directly
if (require.main === module) {
  warmAllCaches()
    .then(({ success }) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export { warmAllCaches };
