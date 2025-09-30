import { ProgressService } from '../../services/gamification/progress.service';
import { prisma } from '../../config/prisma';
import { mockRedisService } from '../setup';
import { 
  createUser, 
  createUserProgress,
  mockPrismaGamificationResponses 
} from '../factories/gamification.factory';

describe('ProgressService', () => {
  let progressService: ProgressService;
  const mockUser = createUser();
  const mockProgress = createUserProgress({ userId: mockUser.id });

  // XP required for each level (example formula: 100 * level^2)
  const calculateXPForLevel = (level: number) => 100 * Math.pow(level, 2);

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance of the service for each test
    progressService = new ProgressService();
    
    // Mock Prisma responses
    mockPrismaGamificationResponses.userProgress.upsert.mockResolvedValue(mockProgress);
    mockPrismaGamificationResponses.userProgress.findUnique.mockResolvedValue(mockProgress);
  });

  describe('addExperience', () => {
    it('should add experience to a user\'s progress', async () => {
      const xpToAdd = 50;
      const currentLevel = mockProgress.level;
      const currentXP = mockProgress.experience;
      const xpForNextLevel = calculateXPForLevel(currentLevel);
      
      // Mock the updated progress
      const updatedProgress = {
        ...mockProgress,
        experience: currentXP + xpToAdd,
        // Level should not change yet
        level: currentLevel,
      };
      
      mockPrismaGamificationResponses.userProgress.upsert.mockResolvedValueOnce(updatedProgress);
      
      const result = await progressService.addExperience(mockUser.id, xpToAdd);
      
      // Verify the progress was updated
      expect(mockPrismaGamificationResponses.userProgress.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        create: {
          userId: mockUser.id,
          level: 1,
          experience: xpToAdd,
          totalPoints: 0,
          rank: 0,
        },
        update: {
          experience: expect.any(Number),
          updatedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual({
        ...updatedProgress,
        xpToNextLevel: xpForNextLevel - (currentXP + xpToAdd),
        didLevelUp: false,
      });
    });

    it('should level up when enough experience is gained', async () => {
      const currentLevel = 1;
      const currentXP = 80; // 80/100 XP for level 1 (needs 100 * 1^2 = 100 XP for next level)
      const xpToAdd = 30; // 80 + 30 = 110 XP, which is enough for level 2
      
      // Mock existing progress
      const existingProgress = {
        ...mockProgress,
        level: currentLevel,
        experience: currentXP,
      };
      
      // Mock updated progress after level up
      const updatedProgress = {
        ...existingProgress,
        level: currentLevel + 1,
        experience: 10, // 110 - 100 = 10 XP into next level
      };
      
      mockPrismaGamificationResponses.userProgress.findUnique.mockResolvedValueOnce(existingProgress);
      mockPrismaGamificationResponses.userProgress.upsert.mockResolvedValueOnce(updatedProgress);
      
      const result = await progressService.addExperience(mockUser.id, xpToAdd);
      
      // Verify the progress was updated with level up
      expect(mockPrismaGamificationResponses.userProgress.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        create: expect.any(Object),
        update: {
          level: currentLevel + 1,
          experience: expect.any(Number),
          updatedAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual({
        ...updatedProgress,
        xpToNextLevel: calculateXPForLevel(updatedProgress.level) - updatedProgress.experience,
        didLevelUp: true,
      });
    });

    it('should handle multiple level ups', async () => {
      const currentLevel = 1;
      const currentXP = 80; // 80/100 XP for level 1
      const xpToAdd = 500; // Enough for multiple level ups
      
      // Mock existing progress
      const existingProgress = {
        ...mockProgress,
        level: currentLevel,
        experience: currentXP,
      };
      
      // Mock updated progress after level ups
      // Level 1: 80 + 500 = 580 XP (level up to 2 at 100 XP, 480 XP remaining)
      // Level 2: 480 - 400 = 80 XP (level up to 3 at 400 XP, 80 XP remaining)
      const updatedProgress = {
        ...existingProgress,
        level: 3,
        experience: 80,
      };
      
      mockPrismaGamificationResponses.userProgress.findUnique.mockResolvedValueOnce(existingProgress);
      mockPrismaGamificationResponses.userProgress.upsert.mockResolvedValueOnce(updatedProgress);
      
      const result = await progressService.addExperience(mockUser.id, xpToAdd);
      
      expect(result).toEqual({
        ...updatedProgress,
        xpToNextLevel: calculateXPForLevel(3) - 80, // 900 - 80 = 820 XP to next level
        didLevelUp: true,
      });
    });
  });

  describe('getUserProgress', () => {
    it('should get the progress for a user', async () => {
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma response
      mockPrismaGamificationResponses.userProgress.findUnique.mockResolvedValueOnce(mockProgress);
      
      const result = await progressService.getUserProgress(mockUser.id);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`user:progress:${mockUser.id}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user:progress:${mockUser.id}`,
        JSON.stringify({
          ...mockProgress,
          xpToNextLevel: calculateXPForLevel(mockProgress.level) - mockProgress.experience,
        }),
        300 // 5 minutes TTL
      );
      
      expect(result).toEqual({
        ...mockProgress,
        xpToNextLevel: calculateXPForLevel(mockProgress.level) - mockProgress.experience,
      });
    });

    it('should return default progress if user has none', async () => {
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma response (no progress)
      mockPrismaGamificationResponses.userProgress.findUnique.mockResolvedValueOnce(null);
      
      // Mock upsert for new progress
      const defaultProgress = {
        id: 'new-progress-id',
        userId: mockUser.id,
        level: 1,
        experience: 0,
        totalPoints: 0,
        rank: 0,
        lastActivityAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      
      mockPrismaGamificationResponses.userProgress.upsert.mockResolvedValueOnce(defaultProgress);
      
      const result = await progressService.getUserProgress(mockUser.id);
      
      expect(result).toEqual({
        ...defaultProgress,
        xpToNextLevel: calculateXPForLevel(1), // 100 XP to next level
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should get the progress leaderboard', async () => {
      const limit = 5;
      const mockLeaderboard = [
        { userId: 'user1', level: 50, experience: 250000, rank: 1 },
        { userId: 'user2', level: 49, experience: 240100, rank: 2 },
      ];
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockLeaderboard);
      
      const result = await progressService.getLeaderboard(limit);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`leaderboard:progress:${limit}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `leaderboard:progress:${limit}`,
        mockLeaderboard,
        300 // 5 minutes TTL
      );
      
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('recalculateRanks', () => {
    it('should recalculate ranks for all users', async () => {
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query for recalculating ranks
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce({ count: 1 });
      
      await progressService.recalculateRanks();
      
      // Verify the rank recalculation query was executed
      expect(prisma.$executeRaw).toHaveBeenCalledWith(expect.any(String));
      
      // Verify the leaderboard cache was invalidated
      expect(mockRedisService.del).toHaveBeenCalledWith(expect.stringMatching(/^leaderboard:/));
    });
  });
});
