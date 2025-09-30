import { BadgeService } from '../../services/gamification/badge.service';
import { prisma } from '../../config/prisma';
import { mockRedisService } from '../setup';
import { 
  createUser, 
  createBadge,
  mockPrismaGamificationResponses 
} from '../factories/gamification.factory';
import { BadgeType } from '@prisma/client';

describe('BadgeService', () => {
  let badgeService: BadgeService;
  const mockUser = createUser();
  const mockBadge = createBadge({ userId: mockUser.id });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance of the service for each test
    badgeService = new BadgeService();
    
    // Mock Prisma responses
    mockPrismaGamificationResponses.badge.create.mockResolvedValue(mockBadge);
    mockPrismaGamificationResponses.badge.findMany.mockResolvedValue([mockBadge]);
    mockPrismaGamificationResponses.badge.count.mockResolvedValue(1);
  });

  describe('awardBadge', () => {
    it('should award a badge to a user', async () => {
      const type = BadgeType.EXPERT_INVESTOR;
      const description = 'Reached expert level';
      
      const result = await badgeService.awardBadge({
        userId: mockUser.id,
        type,
        description,
      });

      expect(mockPrismaGamificationResponses.badge.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          type,
          description,
          metadata: {},
          awardedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual(mockBadge);
    });

    it('should not award duplicate badges by default', async () => {
      const type = BadgeType.BEGINNER;
      
      // Mock that the user already has this badge
      mockPrismaGamificationResponses.badge.findUnique.mockResolvedValueOnce(mockBadge);
      
      const result = await badgeService.awardBadge({
        userId: mockUser.id,
        type,
        description: 'Beginner badge',
      });

      expect(mockPrismaGamificationResponses.badge.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should award duplicate badges when allowDuplicates is true', async () => {
      const type = BadgeType.STREAK_MASTER;
      
      // Mock that the user already has this badge but we're allowing duplicates
      mockPrismaGamificationResponses.badge.findUnique.mockResolvedValueOnce(mockBadge);
      
      const result = await badgeService.awardBadge({
        userId: mockUser.id,
        type,
        description: 'Another streak master badge',
        allowDuplicates: true,
      });

      expect(mockPrismaGamificationResponses.badge.create).toHaveBeenCalled();
      expect(result).toEqual(mockBadge);
    });
  });

  describe('getUserBadges', () => {
    it('should get all badges for a user', async () => {
      const result = await badgeService.getUserBadges(mockUser.id);
      
      expect(mockPrismaGamificationResponses.badge.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { awardedAt: 'desc' },
      });
      
      expect(result).toEqual([mockBadge]);
    });

    it('should filter badges by type', async () => {
      const type = BadgeType.ACHIEVER;
      
      await badgeService.getUserBadges(mockUser.id, type);
      
      expect(mockPrismaGamificationResponses.badge.findMany).toHaveBeenCalledWith({
        where: { 
          userId: mockUser.id,
          type,
        },
        orderBy: { awardedAt: 'desc' },
      });
    });
  });

  describe('hasBadge', () => {
    it('should check if a user has a specific badge', async () => {
      const type = BadgeType.TOP_CONTRIBUTOR;
      
      // Mock that the user has the badge
      mockPrismaGamificationResponses.badge.count.mockResolvedValueOnce(1);
      
      const result = await badgeService.hasBadge(mockUser.id, type);
      
      expect(mockPrismaGamificationResponses.badge.count).toHaveBeenCalledWith({
        where: { 
          userId: mockUser.id,
          type,
        },
      });
      
      expect(result).toBe(true);
    });

    it('should return false if user does not have the badge', async () => {
      const type = BadgeType.LEGENDARY;
      
      // Mock that the user doesn't have the badge
      mockPrismaGamificationResponses.badge.count.mockResolvedValueOnce(0);
      
      const result = await badgeService.hasBadge(mockUser.id, type);
      expect(result).toBe(false);
    });
  });

  describe('getBadgeLeaderboard', () => {
    it('should get the badge leaderboard', async () => {
      const limit = 5;
      const mockLeaderboard = [
        { userId: 'user1', count: 10 },
        { userId: 'user2', count: 8 },
      ];
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockLeaderboard);
      
      const result = await badgeService.getBadgeLeaderboard(limit);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`leaderboard:badges:${limit}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `leaderboard:badges:${limit}`,
        mockLeaderboard,
        300 // 5 minutes TTL
      );
      
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('getRareBadges', () => {
    it('should get the rarest badges', async () => {
      const limit = 3;
      const mockRareBadges = [
        { type: BadgeType.LEGENDARY, count: 5 },
        { type: BadgeType.EXPERT_INVESTOR, count: 10 },
      ];
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockRareBadges);
      
      const result = await badgeService.getRareBadges(limit);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`badges:rare:${limit}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `badges:rare:${limit}`,
        mockRareBadges,
        3600 // 1 hour TTL
      );
      
      expect(result).toEqual(mockRareBadges);
    });
  });
});
