import { Prisma, PrismaClient, PointTransactionType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseService } from '../base.service';

export interface AwardPointsInput {
  userId: string;
  points: number;
  type: PointTransactionType;
  description: string;
  metadata?: Record<string, any>;
  expiresInDays?: number;
}

export interface PointsLeaderboardEntry {
  userId: string;
  total: number;
  rank: number;
}

export class PointsService extends BaseService {
  private static instance: PointsService;
  
  private constructor() {
    super(300); // 5 minutes cache TTL by default
  }

  public static getInstance(): PointsService {
    if (!PointsService.instance) {
      PointsService.instance = new PointsService();
    }
    return PointsService.instance;
  }

  public async awardPoints(input: AwardPointsInput) {
    const { userId, points, type, description, metadata = {}, expiresInDays = 30 } = input;
    
    // Don't create transactions for zero points
    if (points <= 0) {
      return null;
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create the point transaction
    const transaction = await prisma.pointTransaction.create({
      data: {
        userId,
        amount: points,
        type,
        description,
        metadata,
        expiresAt,
      },
    });

    // Invalidate relevant caches
    await this.invalidateUserCaches(userId);

    return transaction;
  }

  public async getUserPoints(userId: string): Promise<number> {
    const cacheKey = this.generateCacheKey('user:points', userId);
    
    return this.getCachedOrFetch<number>(cacheKey, async () => {
      const result = await prisma.pointTransaction.aggregate({
        where: {
          userId,
          expiresAt: { gt: new Date() }, // Only count unexpired points
        },
        _sum: { amount: true },
      });

      return result._sum.amount?.toNumber() || 0;
    });
  }

  public async getUserTransactions(
    userId: string,
    { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
  ) {
    const skip = (page - 1) * limit;
    
    return prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  public async getLeaderboard(limit: number = 10): Promise<PointsLeaderboardEntry[]> {
    const cacheKey = this.generateCacheKey('leaderboard:points', limit);
    
    return this.getCachedOrFetch<PointsLeaderboardEntry[]>(cacheKey, async () => {
      // Using raw query for better performance with window functions
      const leaderboard = await prisma.$queryRaw<PointsLeaderboardEntry[]>`
        WITH ranked_users AS (
          SELECT 
            "userId",
            SUM(amount) as total,
            RANK() OVER (ORDER BY SUM(amount) DESC) as rank
          FROM "PointTransaction"
          WHERE "expiresAt" > NOW()
          GROUP BY "userId"
          ORDER BY total DESC
          LIMIT ${limit}
        )
        SELECT * FROM ranked_users;
      `;

      return leaderboard;
    });
  }

  public async getUserRank(userId: string): Promise<number | null> {
    const cacheKey = this.generateCacheKey('user:rank', userId);
    
    return this.getCachedOrFetch<number | null>(cacheKey, async () => {
      const result = await prisma.$queryRaw<Array<{ rank: number }>>`
        WITH ranked_users AS (
          SELECT 
            "userId",
            RANK() OVER (ORDER BY SUM(amount) DESC) as rank
          FROM "PointTransaction"
          WHERE "expiresAt" > NOW()
          GROUP BY "userId"
        )
        SELECT rank FROM ranked_users WHERE "userId" = ${userId};
      `;

      return result.length > 0 ? result[0].rank : null;
    });
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    const cacheKeys = [
      this.generateCacheKey('user:points', userId),
      this.generateCacheKey('user:rank', userId),
      'leaderboard:points:*', // Invalidate all leaderboard caches
    ];
    
    await this.invalidateCache(cacheKeys);
  }
}

// Export a singleton instance
export const pointsService = PointsService.getInstance();
