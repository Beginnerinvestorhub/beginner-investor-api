import { BadgeType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import BaseService from "../base.service";

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
  rarity: number;
}

export class BadgeService extends BaseService {
  private static instance: BadgeService;

  private constructor() {
    super(300);
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  public async awardBadge(input: AwardBadgeInput) {
    const {
      userId,
      type,
      description,
      metadata = {},
      allowDuplicates = false,
    } = input;

    if (!allowDuplicates && (await this.hasBadge(userId, type))) {
      return null;
    }

    const badge = await prisma.badge.create({
      data: {
        userId,
        type,
        description,
        metadata,
        awardedAt: new Date(),
      },
    });

    await this.invalidateUserCaches(userId);
    return badge;
  }

  public async getUserBadges(userId: string, type?: BadgeType) {
    const cacheKey = this.generateCacheKey(
      "user:badges",
      userId,
      type || "all",
    );
    return this.getCachedOrFetch(cacheKey, () =>
      prisma.badge.findMany({
        where: { userId, ...(type ? { type } : {}) },
        orderBy: { awardedAt: "desc" },
      }),
    );
  }

  public async hasBadge(userId: string, type: BadgeType): Promise<boolean> {
    const cacheKey = this.generateCacheKey("user:hasBadge", userId, type);
    return this.getCachedOrFetch(cacheKey, async () => {
      const count = await prisma.badge.count({ where: { userId, type } });
      return count > 0;
    });
  }

  public async getBadgeLeaderboard(
    limit = 10,
  ): Promise<BadgeLeaderboardEntry[]> {
    const cacheKey = this.generateCacheKey("leaderboard:badges", limit);
    return this.getCachedOrFetch(cacheKey, async () => {
      return prisma.$queryRaw<BadgeLeaderboardEntry[]>`
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
    });
  }

  public async getRareBadges(limit = 5): Promise<RareBadge[]> {
    const cacheKey = this.generateCacheKey("badges:rare", limit);
    return this.getCachedOrFetch(
      cacheKey,
      async () => {
        const totalUsers = await prisma.user.count();
        if (totalUsers === 0) return [];

        const rareBadges = await prisma.$queryRaw<
          Array<{ type: BadgeType; count: number }>
        >`
        SELECT 
          type,
          COUNT(DISTINCT "userId") as count
        FROM "Badge"
        GROUP BY type
        ORDER BY count ASC
        LIMIT ${limit};
      `;

        return rareBadges.map((b) => ({
          ...b,
          rarity: Math.round((b.count / totalUsers) * 10000) / 100, // 2 decimal places
        }));
      },
      3600,
    );
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    const cacheKeys = [
      this.generateCacheKey("user:badges", userId, "*"),
      this.generateCacheKey("user:hasBadge", userId, "*"),
      "leaderboard:badges:*",
      "badges:rare:*",
    ];
    await this.invalidateCache(cacheKeys);
  }
}

export const badgeService = BadgeService.getInstance();
