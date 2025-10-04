import { PointTransactionType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import BaseService from '../base.service';

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
    super(300);
  }

  public static getInstance(): PointsService {
    if (!PointsService.instance) {
      PointsService.instance = new PointsService();
    }
    return PointsService.instance;
  }

  public async awardPoints(input: AwardPointsInput) {
    const { userId, points, type, description, metadata = {}, expiresInDays = 30 } = input;
    if (points <= 0) return null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

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

    await this.invalidateUserCaches(userId);
    return transaction;
  }

  public async getUserPoints(userId: string): Promise<number> {
    const cacheKey = this.generateCacheKey('user:points', userId);
    return this.getCachedOrFetch<number>(cacheKey, async () => {
      const result = await prisma.pointTransaction.aggregate({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        _sum: { amount: true },
      });

      return result._sum.amount ?? 0;
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

  public async getLeaderboard(limit = 10): Promise<PointsLeaderboardEntry[]> {
    const cacheKey = this.generateCacheKey('leaderboard:points', limit);
    return this.getCachedOrFetch<PointsLeaderboardEntry[]>(cacheKey, async () => {
      return prisma.$queryRaw<PointsLeaderboardEntry[]>`
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
      'leaderboard:points:*',
    ];
    await this.invalidateCache(cacheKeys);
  }
}

export const pointsService = PointsService.getInstance();
