import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseService } from '../base.service';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  daysUntilReset: number;
}

export class StreakService extends BaseService {
  private static instance: StreakService;
  private readonly STREAK_RESET_DAYS = 2; // Streak resets after 2 days of inactivity
  
  private constructor() {
    super(300); // 5 minutes cache TTL by default
  }

  public static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }

  public async recordActivity(userId: string): Promise<StreakData> {
    const now = new Date();
    const today = this.startOfDay(now);
    const yesterday = this.startOfDay(new Date(now));
    yesterday.setDate(yesterday.getDate() - 1);

    // Get or create the user's streak
    const streak = await this.getOrCreateStreak(userId);
    
    // Check if we've already recorded activity today
    const lastActivity = this.startOfDay(streak.lastActivityDate);
    if (lastActivity.getTime() === today.getTime()) {
      return this.formatStreakData(streak);
    }

    // Calculate days since last activity
    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;

    // Update streak based on activity
    if (daysSinceLastActivity === 1) {
      // Consecutive day - increment streak
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysSinceLastActivity > this.STREAK_RESET_DAYS) {
      // Streak broken - reset to 1
      currentStreak = 1;
    }
    // If exactly 2 days, maintain current streak (grace period)

    // Update the streak in the database
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

    // Invalidate relevant caches
    await this.invalidateUserCaches(userId);

    return this.formatStreakData(updatedStreak);
  }

  public async getUserStreak(userId: string): Promise<StreakData | null> {
    const cacheKey = this.generateCacheKey('user:streak', userId);
    
    return this.getCachedOrFetch<StreakData | null>(cacheKey, async () => {
      const streak = await prisma.streak.findUnique({
        where: { userId },
      });

      if (!streak) {
        return null;
      }

      return this.formatStreakData(streak);
    });
  }

  public async getStreakLeaderboard(limit: number = 10) {
    const cacheKey = this.generateCacheKey('leaderboard:streaks', limit);
    
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
    const now = new Date();
    const lastActivity = this.startOfDay(streak.lastActivityDate);
    const today = this.startOfDay(now);
    
    // Calculate days since last activity
    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days until streak resets (0 if already reset)
    const daysUntilReset = Math.max(0, this.STREAK_RESET_DAYS - daysSinceLastActivity);

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
        lastActivityDate: new Date(0), // Very old date to trigger streak logic
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
      this.generateCacheKey('user:streak', userId),
      'leaderboard:streaks:*', // Invalidate all streak leaderboard caches
    ];
    
    await this.invalidateCache(cacheKeys);
  }
}

// Export a singleton instance
export const streakService = StreakService.getInstance();
