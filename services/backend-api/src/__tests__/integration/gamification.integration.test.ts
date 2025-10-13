import { PrismaClient, PointTransactionType, BadgeType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { pointsService } from "../../services/gamification/points.service";
import { badgeService } from "../../services/gamification/badge.service";
import { streakService } from "../../services/gamification/streak.service";
import { progressService } from "../../services/gamification/progress.service";
import { createUser } from "../factories/user.factory";
import { mockRedisService } from "../setup";

describe("Gamification Integration", () => {
  let testUser: { id: string };
  const testUserId = "test-user-123";

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.upsert({
      where: { id: testUserId },
      create: { id: testUserId, email: "test@example.com", name: "Test User" },
      update: {},
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.pointTransaction.deleteMany({ where: { userId: testUserId } });
    await prisma.badge.deleteMany({ where: { userId: testUserId } });
    await prisma.streak.deleteMany({ where: { userId: testUserId } });
    await prisma.userProgress.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    // Disconnect Prisma
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clear Redis mocks after each test
    jest.clearAllMocks();
  });

  describe("Points and Level Progression", () => {
    it("should award points and level up user", async () => {
      // Initial progress should be at level 1 with 0 XP
      let progress = await progressService.getUserProgress(testUserId);
      expect(progress.level).toBe(1);
      expect(progress.experience).toBe(0);

      // Award enough XP to level up (100 XP needed for level 2)
      const xpToAdd = 150; // Enough for level 2 with 50 XP remaining
      await pointsService.awardPoints({
        userId: testUserId,
        points: xpToAdd,
        type: PointTransactionType.LEARNING,
        description: "Completed a course",
      });

      // Check updated progress
      progress = await progressService.getUserProgress(testUserId);
      expect(progress.level).toBe(2);
      expect(progress.experience).toBe(50); // 150 - 100 (for level 2)
      expect(progress.totalPoints).toBe(xpToAdd);

      // Check points service
      const totalPoints = await pointsService.getUserPoints(testUserId);
      expect(totalPoints).toBe(xpToAdd);
    });
  });

  describe("Badge Awarding", () => {
    it("should award badges based on achievements", async () => {
      // Award a badge for first login
      const badge = await badgeService.awardBadge({
        userId: testUserId,
        type: BadgeType.FIRST_LOGIN,
        description: "First login",
      });

      expect(badge).toBeDefined();
      expect(badge.type).toBe(BadgeType.FIRST_LOGIN);

      // Check that the badge was awarded
      const badges = await badgeService.getUserBadges(testUserId);
      expect(badges.some((b) => b.type === BadgeType.FIRST_LOGIN)).toBe(true);
    });

    it("should not award duplicate badges by default", async () => {
      // Try to award the same badge again
      const duplicateBadge = await badgeService.awardBadge({
        userId: testUserId,
        type: BadgeType.FIRST_LOGIN,
        description: "First login (duplicate)",
      });

      // Should return null since the badge was already awarded
      expect(duplicateBadge).toBeNull();
    });
  });

  describe("Streak Tracking", () => {
    it("should track consecutive daily logins", async () => {
      // Record first login (today)
      const today = new Date();
      const streak1 = await streakService.recordActivity(testUserId);
      expect(streak1.currentStreak).toBe(1);
      expect(streak1.longestStreak).toBe(1);

      // Mock Redis to simulate a cache miss for the next test
      mockRedisService.get.mockResolvedValueOnce(null);

      // Record activity for the next day
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      jest.useFakeTimers().setSystemTime(tomorrow);

      const streak2 = await streakService.recordActivity(testUserId);
      expect(streak2.currentStreak).toBe(2);
      expect(streak2.longestStreak).toBe(2);

      // Skip a day and record activity (should reset streak)
      const twoDaysLater = new Date(tomorrow);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      jest.setSystemTime(twoDaysLater);

      mockRedisService.get.mockResolvedValueOnce(null);
      const streak3 = await streakService.recordActivity(testUserId);
      expect(streak3.currentStreak).toBe(1); // Reset to 1
      expect(streak3.longestStreak).toBe(2); // Longest streak remains 2

      // Reset timer
      jest.useRealTimers();
    });
  });

  describe("Leaderboards", () => {
    it("should return user rankings", async () => {
      // Add some test data
      await pointsService.awardPoints({
        userId: testUserId,
        points: 200,
        type: PointTransactionType.LEARNING,
        description: "Test points for leaderboard",
      });

      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);

      // Get leaderboard
      const leaderboard = await progressService.getLeaderboard(10);

      // User should be on the leaderboard
      const userOnLeaderboard = leaderboard.some(
        (entry) => entry.userId === testUserId,
      );
      expect(userOnLeaderboard).toBe(true);

      // Check that the user's rank is set
      const userRank = await progressService.getUserRank(testUserId);
      expect(userRank).toBeGreaterThan(0);
    });
  });

  describe("Caching", () => {
    it("should use cache for subsequent requests", async () => {
      // First request - should hit the database
      mockRedisService.get.mockResolvedValueOnce(null);
      await pointsService.getUserPoints(testUserId);

      // Second request - should use cache
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(200));
      const points = await pointsService.getUserPoints(testUserId);

      // Should return cached value without calling Redis get again
      expect(points).toBe(200);
      expect(mockRedisService.get).toHaveBeenCalledTimes(1);
    });

    it("should invalidate cache on updates", async () => {
      // Initial value
      await pointsService.awardPoints({
        userId: testUserId,
        points: 100,
        type: PointTransactionType.LEARNING,
        description: "Cache test",
      });

      // Should invalidate cache
      expect(mockRedisService.del).toHaveBeenCalledWith(
        expect.stringContaining(`user:points:${testUserId}`),
      );
    });
  });
});
