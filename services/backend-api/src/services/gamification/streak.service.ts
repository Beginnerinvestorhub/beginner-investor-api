import { prisma } from "../../config/prisma";
import BaseService from "../base.service";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  daysUntilReset: number;
}

export class StreakService extends BaseService {
  private static instance: StreakService;
  private readonly STREAK_RESET_DAYS = 2;

  private constructor() {
    super(300);
  }

  public static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }

  public async recordActivity(userId: string): Promise<StreakData> {
    const today = this.startOfDay(new Date());
    const streak = await this.getOrCreateStreak(userId);
    const lastActivity = this.startOfDay(streak.lastActivityDate);

    if (lastActivity.getTime() === today.getTime()) {
      return this.formatStreakData(streak);
    }

    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;

    if (daysSinceLastActivity === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysSinceLastActivity > this.STREAK_RESET_DAYS) {
      currentStreak = 1;
    }

    const updatedStreak = await prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak,
        longestStreak,
        lastActivityDate: today,
      },
      update: {
        currentStreak,
        longestStreak,
        lastActivityDate: today,
      },
    });

    await this.invalidateUserCaches(userId);
    return this.formatStreakData(updatedStreak);
  }

  public async getUserStreak(userId: string): Promise<StreakData | null> {
    const cacheKey = this.generateCacheKey("user:streak", userId);

    return this.getCachedOrFetch<StreakData | null>(cacheKey, async () => {
      const streak = await prisma.streak.findUnique({ where: { userId } });
      return streak ? this.formatStreakData(streak) : null;
    });
  }

  public async getStreakLeaderboard(limit = 10) {
    const cacheKey = this.generateCacheKey("leaderboard:streaks", limit);

    return this.getCachedOrFetch(cacheKey, async () => {
      return prisma.$queryRaw`
        SELECT 
          "userId", 
          "currentStreak",
          "longestStreak",
          "lastActivityDate",
          RANK() OVER (ORDER BY "currentStreak" DESC, "longestStreak" DESC) as rank
        FROM "Streak"
        ORDER BY "currentStreak" DESC, "longestStreak" DESC
        LIMIT ${limit};
      `;
    });
  }

  public async getLongestStreak(userId: string): Promise<number> {
    const streak = await prisma.streak.findUnique({
      where: { userId },
      select: { longestStreak: true },
    });

    return streak?.longestStreak || 0;
  }

  private formatStreakData(streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  }): StreakData {
    const today = this.startOfDay(new Date());
    const lastActivity = this.startOfDay(streak.lastActivityDate);

    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    const daysUntilReset = Math.max(
      0,
      this.STREAK_RESET_DAYS - daysSinceLastActivity,
    );

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
      daysUntilReset,
    };
  }

  private async getOrCreateStreak(userId: string) {
    return prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(0),
      },
      update: {},
    });
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    const cacheKeys = [
      this.generateCacheKey("user:streak", userId),
      "leaderboard:streaks:*",
    ];
    await this.invalidateCache(cacheKeys);
  }
}

export const streakService = StreakService.getInstance();
