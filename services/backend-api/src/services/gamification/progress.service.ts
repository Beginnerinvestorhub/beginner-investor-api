import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import BaseService from "../base.service";

export interface UserProgressWithRank {
  id: string;
  userId: string;
  level: number;
  experience: number;
  totalPoints: number;
  rank: number;
  lastActivityAt: Date;
  xpToNextLevel: number;
}

export class ProgressService extends BaseService {
  private static instance: ProgressService;

  private constructor() {
    super(300);
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  public async addExperience(
    userId: string,
    xpToAdd: number,
  ): Promise<UserProgressWithRank> {
    if (xpToAdd <= 0) {
      return this.getUserProgress(userId);
    }

    return prisma.$transaction(async (tx) => {
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

      let { level, experience } = progress;
      let newExperience = experience + xpToAdd;
      let levelUps = 0;

      while (newExperience >= this.getXpForLevel(level + 1)) {
        newExperience -= this.getXpForLevel(level + 1);
        level++;
        levelUps++;
      }

      progress = await tx.userProgress.update({
        where: { userId },
        data: {
          level: { increment: levelUps },
          experience: newExperience,
          totalPoints: { increment: xpToAdd },
          lastActivityAt: new Date(),
        },
      });

      if (levelUps > 0) {
        await this.recalculateRanks(tx);
      }

      const rank = await this.getUserRank(userId, tx);
      await this.invalidateUserCaches(userId);

      return {
        ...progress,
        rank,
        xpToNextLevel:
          this.getXpForLevel(progress.level + 1) - progress.experience,
      };
    });
  }

  public async getUserProgress(userId: string): Promise<UserProgressWithRank> {
    const cacheKey = this.generateCacheKey("user:progress", userId);

    return this.getCachedOrFetch(cacheKey, async () => {
      const progress = await prisma.userProgress.findUnique({
        where: { userId },
      });

      if (!progress) {
        return this.createDefaultProgress(userId);
      }

      const rank = await this.getUserRank(userId);

      return {
        ...progress,
        rank,
        xpToNextLevel:
          this.getXpForLevel(progress.level + 1) - progress.experience,
      };
    });
  }

  public async getLeaderboard(limit = 10): Promise<UserProgressWithRank[]> {
    const cacheKey = this.generateCacheKey("leaderboard:progress", limit);

    return this.getCachedOrFetch(cacheKey, async () => {
      const leaderboard = await prisma.$queryRaw<UserProgressWithRank[]>`
        WITH ranked_users AS (
          SELECT 
            *,
            RANK() OVER (ORDER BY level DESC, "totalPoints" DESC) as rank,
            (100 * (level + 1) * (level + 1)) - experience as "xpToNextLevel"
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

    await this.invalidateCache("leaderboard:progress:*");
  }

  public async getUserRank(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const prismaClient = tx || prisma;

    const result = await prismaClient.$queryRaw<Array<{ rank: number }>>`
      SELECT "rank" FROM "UserProgress" WHERE "userId" = ${userId};
    `;

    return result[0]?.rank || 0;
  }

  private getXpForLevel(level: number): number {
    return 100 * level * level;
  }

  private async createDefaultProgress(
    userId: string,
  ): Promise<UserProgressWithRank> {
    const progress = await prisma.userProgress.create({
      data: {
        userId,
        level: 1,
        experience: 0,
        totalPoints: 0,
        rank: 0,
      },
    });

    await this.recalculateRanks();

    return {
      ...progress,
      rank: 0,
      xpToNextLevel: this.getXpForLevel(2),
    };
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    const cacheKeys = [
      this.generateCacheKey("user:progress", userId),
      "leaderboard:progress:*",
    ];
    await this.invalidateCache(cacheKeys);
  }
}

export const progressService = ProgressService.getInstance();
