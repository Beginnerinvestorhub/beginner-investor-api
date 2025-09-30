import { Prisma, PrismaClient, BadgeType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseService } from '../base.service';

export interface AwardBadgeInput {
  userId: string;
  type: BadgeType;
  description: string;
  metadata?: Record<string, any>;
  allowDuplicates?: boolean;
}

export interface BadgeLeaderboardEntry {
  userId: string;
  count: number;
  rank: number;
}

export interface RareBadge {
  type: BadgeType;
  count: number;
  rarity: number; // percentage of users who have this badge
}

export class BadgeService extends BaseService {
  private static instance: BadgeService;
  
  private constructor() {
    super(300); // 5 minutes cache TTL by default
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  public async awardBadge(input: AwardBadgeInput) {
    const { userId, type, description, metadata = {}, allowDuplicates = false } = input;
    
    // Check if user already has this badge (if duplicates are not allowed)
    if (!allowDuplicates) {
      const hasBadge = await this.hasBadge(userId, type);
      if (hasBadge) {
        return null;
      }
    }

    // Create the badge
    const badge = await prisma.badge.create({
      data: {
        userId,
        type,
        description,
        metadata,
        awardedAt: new Date(),
      },
    });

    // Invalidate relevant caches
    await this.invalidateUserCaches(userId);

    return badge;
  }

  public async getUserBadges(userId: string, type?: BadgeType) {
    const cacheKey = this.generateCacheKey('user:badges', userId, type || 'all');
    
    return this.getCachedOrFetch(cacheKey, () => {
      return prisma.badge.findMany({
        where: { 
          userId,
          ...(type ? { type } : {}),
        },
        orderBy: { awardedAt: 'desc' },
      });
    });
  }

  public async hasBadge(userId: string, type: BadgeType): Promise<boolean> {
    const cacheKey = this.generateCacheKey('user:hasBadge', userId, type);
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const count = await prisma.badge.count({
        where: { userId, type },
      });
      
      return count > 0;
    });
  }

  public async getBadgeLeaderboard(limit: number = 10): Promise<BadgeLeaderboardEntry[]> {
    const cacheKey = this.generateCacheKey('leaderboard:badges', limit);
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const leaderboard = await prisma.$queryRaw<BadgeLeaderboardEntry[]>`
        WITH badge_counts AS (
          SELECT 
            "userId",
            COUNT(*) as count,
            RANK() OVER (ORDER BY COUNT(*) DESC) as rank
          FROM "Badge"
          GROUP BY "userId"
          ORDER BY count DESC
          LIMIT ${limit}
        )
        SELECT * FROM badge_counts;
      `;

      return leaderboard;
    });
  }

  public async getRareBadges(limit: number = 5): Promise<RareBadge[]> {
    const cacheKey = this.generateCacheKey('badges:rare', limit);
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Get total number of users
      const totalUsers = await prisma.user.count();
      
      if (totalUsers === 0) {
        return [];
      }

      // Get badge counts and calculate rarity
      const rareBadges = await prisma.$queryRaw<Array<{ type: BadgeType, count: number }>>`
        SELECT 
          type,
          COUNT(DISTINCT "userId") as count
        FROM "Badge"
        GROUP BY type
        ORDER BY count ASC
        LIMIT ${limit};
      `;

      return rareBadges.map(badge => ({
        ...badge,
        rarity: Math.round((badge.count / totalUsers) * 100) / 100, // 2 decimal places
      }));
    }, 3600); // 1 hour cache TTL for rare badges
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    const cacheKeys = [
      this.generateCacheKey('user:badges', userId, '*'),
      this.generateCacheKey('user:hasBadge', userId, '*'),
      'leaderboard:badges:*', // Invalidate all badge leaderboard caches
      'badges:rare:*', // Invalidate rare badges cache
    ];
    
    await this.invalidateCache(cacheKeys);
  }
}

// Export a singleton instance
export const badgeService = BadgeService.getInstance();
