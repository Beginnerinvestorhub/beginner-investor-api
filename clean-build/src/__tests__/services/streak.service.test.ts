import { StreakService } from '../../services/gamification/streak.service';
import { prisma } from '../../config/prisma';
import { mockRedisService } from '../setup';
import { 
  createUser, 
  createStreak,
  mockPrismaGamificationResponses 
} from '../factories/gamification.factory';

describe('StreakService', () => {
  let streakService: StreakService;
  const mockUser = createUser();
  const mockUserStreak = createStreak({ userId: mockUser.id });

  // Mock dates
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Date
    jest.useFakeTimers().setSystemTime(today);
    
    // Create a new instance of the service for each test
    streakService = new StreakService();
    
    // Reset mock implementations
    mockPrismaGamificationResponses.streak.findUnique.mockReset();
    mockPrismaGamificationResponses.streak.upsert.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordActivity', () => {
    it('should create a new streak for first-time activity', async () => {
      // Mock no existing streak
      mockPrismaGamificationResponses.streak.findUnique.mockResolvedValueOnce(null);
      
      // Mock upsert for new streak
      mockPrismaGamificationResponses.streak.upsert.mockResolvedValueOnce({
        ...mockUserStreak,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      });

      const result = await streakService.recordActivity(mockUser.id);

      // Verify the streak was created
      expect(mockPrismaGamificationResponses.streak.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        create: {
          userId: mockUser.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
        },
        update: expect.any(Object),
      });
      
      expect(result).toEqual({
        ...mockUserStreak,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      });
    });

    it('should increment streak for consecutive days', async () => {
      // Mock existing streak from yesterday
      mockPrismaGamificationResponses.streak.findUnique.mockResolvedValueOnce({
        ...mockUserStreak,
        currentStreak: 5,
        longestStreak: 5,
        lastActivityDate: yesterday,
      });
      
      // Mock upsert for updated streak
      mockPrismaGamificationResponses.streak.upsert.mockResolvedValueOnce({
        ...mockUserStreak,
        currentStreak: 6,
        longestStreak: 6, // Longest streak also increases
        lastActivityDate: today,
      });

      const result = await streakService.recordActivity(mockUser.id);

      // Verify the streak was updated
      expect(mockPrismaGamificationResponses.streak.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        create: expect.any(Object),
        update: {
          currentStreak: 6,
          longestStreak: 6,
          lastActivityDate: today,
        },
      });
      
      expect(result).toEqual({
        ...mockUserStreak,
        currentStreak: 6,
        longestStreak: 6,
        lastActivityDate: today,
      });
    });

    it('should reset streak after a missed day', async () => {
      // Mock existing streak from two days ago
      mockPrismaGamificationResponses.streak.findUnique.mockResolvedValueOnce({
        ...mockUserStreak,
        currentStreak: 3,
        longestStreak: 5,
        lastActivityDate: twoDaysAgo,
      });
      
      // Mock upsert for reset streak
      mockPrismaGamificationResponses.streak.upsert.mockResolvedValueOnce({
        ...mockUserStreak,
        currentStreak: 1, // Reset to 1
        longestStreak: 5, // Longest streak remains
        lastActivityDate: today,
      });

      const result = await streakService.recordActivity(mockUser.id);

      // Verify the streak was reset
      expect(mockPrismaGamificationResponses.streak.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        create: expect.any(Object),
        update: {
          currentStreak: 1,
          lastActivityDate: today,
        },
      });
      
      expect(result).toEqual({
        ...mockUserStreak,
        currentStreak: 1,
        longestStreak: 5,
        lastActivityDate: today,
      });
    });
  });

  describe('getUserStreak', () => {
    it('should return the current streak for a user', async () => {
      const mockStreak = createStreak({ 
        userId: mockUser.id,
        currentStreak: 7,
        longestStreak: 10,
        lastActivityDate: today,
      });
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma response
      mockPrismaGamificationResponses.streak.findUnique.mockResolvedValueOnce(mockStreak);
      
      const result = await streakService.getUserStreak(mockUser.id);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`user:streak:${mockUser.id}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user:streak:${mockUser.id}`,
        JSON.stringify(mockStreak),
        300 // 5 minutes TTL
      );
      
      expect(result).toEqual(mockStreak);
    });

    it('should return null if user has no streak', async () => {
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma response (no streak)
      mockPrismaGamificationResponses.streak.findUnique.mockResolvedValueOnce(null);
      
      const result = await streakService.getUserStreak('user-with-no-streak');
      
      expect(result).toBeNull();
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it('should return cached streak if available', async () => {
      const cachedStreak = {
        ...mockUserStreak,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: today.toISOString(),
      };
      
      // Mock Redis cache hit
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedStreak));
      
      const result = await streakService.getUserStreak(mockUser.id);
      
      // Verify Redis was checked and Prisma was not called
      expect(mockRedisService.get).toHaveBeenCalledWith(`user:streak:${mockUser.id}`);
      expect(mockPrismaGamificationResponses.streak.findUnique).not.toHaveBeenCalled();
      
      expect(result).toEqual(cachedStreak);
    });
  });

  describe('getStreakLeaderboard', () => {
    it('should get the streak leaderboard', async () => {
      const limit = 5;
      const mockLeaderboard = [
        { userId: 'user1', currentStreak: 100 },
        { userId: 'user2', currentStreak: 75 },
      ];
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockLeaderboard);
      
      const result = await streakService.getStreakLeaderboard(limit);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`leaderboard:streaks:${limit}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `leaderboard:streaks:${limit}`,
        mockLeaderboard,
        300 // 5 minutes TTL
      );
      
      expect(result).toEqual(mockLeaderboard);
    });
  });
});
