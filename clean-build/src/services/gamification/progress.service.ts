import { Prisma, PrismaClient, UserProgress } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseService } from '../base.service';

export interface UserProgressWithRank extends UserProgress {
  rank?: number;
  xpToNextLevel: number;
}

export class ProgressService extends BaseService {
  private static instance: ProgressService;
  
  private constructor() {
    super(300); // 5 minutes cache TTL by default
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  public async addExperience(userId: string, xpToAdd: number): Promise<UserProgressWithRank> {
    if (xpToAdd <= 0) {
      return this.getUserProgress(userId);
    }

    // Use a transaction to ensure data consistency
    return prisma.$transaction(async (tx) => {
      // Get or create user progress with row-level lock
      let progress = await tx.userProgress.upsert({
        where: { userId },
        create: {
          userId,
          level: 1,
          experience: 0,
          totalPoints: 0,
          rank: 0,
        },
        update: {},
      });

      // Calculate new experience and level
      let { level, experience } = progress;
      let newExperience = experience + xpToAdd;
      let levelUps = 0;

      // Calculate level ups
      while (newExperience >= this.getXpForLevel(level + 1)) {
        newExperience -= this.getXpForLevel(level + 1);
        level++;
        levelUps++;
      }

      // Update progress
      progress = await tx.userProgress.update({
        where: { userId },
        data: {
          level: { increment: levelUps },
          experience: newExperience,
          totalPoints: { increment: xpToAdd },
          lastActivityAt: new Date(),
        },
      });

      // Recalculate ranks if there were level ups
      if (levelUps > 0) {
        await this.recalculateRanks(tx);
      }

      // Get the user's rank
      const rank = await this.getUserRank(userId, tx);
      
      // Invalidate caches
      await this.invalidateUserCaches(userId);

      return {
        ...progress,
        rank,
        xpToNextLevel: this.getXpForLevel(progress.level + 1) - progress.experience,
      };
    });
  }

  public async getUserProgress(userId: string): Promise<UserProgressWithRank> {
    const cacheKey = this.generateCacheKey('user:progress', userId);
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const progress = await prisma.userProgress.findUnique({
        where: { userId },
      });

      if (!progress) {
        // Create default progress if it doesn't exist
        return this.createDefaultProgress(userId);
      }

      const rank = await this.getUserRank(userId);
      
      return {
        ...progress,
        rank,
        xpToNextLevel: this.getXpForLevel(progress.level + 1) - progress.experience,
      };
    });
  }

  public async getLeaderboard(limit: number = 10): Promise<UserProgressWithRank[]> {
    const cacheKey = this.generateCacheKey('leaderboard:progress', limit);
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Use raw query for better performance with ranking
      const leaderboard = await prisma.$queryRaw<UserProgressWithRank[]>`
        WITH ranked_users AS (
          SELECT 
            *,
            RANK() OVER (ORDER BY level DESC, "totalPoints" DESC) as rank,
            (SELECT (100 * (level + 1) * (level + 1)) - experience as xp_to_next_level)
          FROM "UserProgress"
          ORDER BY level DESC, "totalPoints" DESC
          LIMIT ${limit}
        )
        SELECT * FROM ranked_users;
      `;

      return leaderboard;
    });
  }

  public async recalculateRanks(tx?: Prisma.TransactionClient): Promise<void> {
    const prismaClient = tx || prisma;
    
    // Update ranks based on level and total points
    await prismaClient.$executeRaw`
      UPDATE "UserProgress" up1
      SET "rank" = subquery.rank
      FROM (
        SELECT 
          id,
          RANK() OVER (ORDER BY level DESC, "totalPoints" DESC) as rank
        FROM "UserProgress"
      ) AS subquery
      WHERE up1.id = subquery.id;
    `;

    // Invalidate all leaderboard caches
    await this.invalidateCache('leaderboard:progress:*');
  }

  public async getUserRank(userId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const prismaClient = tx || prisma;
    
    const result = await prismaClient.$queryRaw<Array<{ rank: number }>>`
      SELECT "rank" 
      FROM "UserProgress" 
      WHERE "userId" = ${userId};
    `;

    return result[0]?.rank || 0;
  }

  private getXpForLevel(level: number): number {
    // Quadratic leveling formula: 100 * level^2
    return 100 * level * level;
  }

  private async createDefaultProgress(userId: string): Promise<UserProgressWithRank> {
    const progress = await prisma.userProgress.create({
      data: {
        userId,
        level: 1,
        experience: 0,
        totalPoints: 0,
        rank: 0,
      },
    });

    // Recalculate all ranks to include the new user
    await this.recalculateRanks();

    return {
      ...progress,
      rank: 0,
      xpToNextLevel: this.getXpForLevel(2), // 100 * 2^2 = 400 XP to next level
    };
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    const cacheKeys = [
      this.generateCacheKey('user:progress', userId),
      'leaderboard:progress:*', // Invalidate all leaderboard caches
    ];
    
    await this.invalidateCache(cacheKeys);
  }
}

// Export a singleton instance
export const progressService = ProgressService.getInstance();
