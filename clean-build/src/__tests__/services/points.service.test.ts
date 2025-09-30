import { PointsService } from '../../services/gamification/points.service';
import { prisma } from '../../config/prisma';
import { mockRedisService } from '../setup';
import { 
  createUser, 
  createPointTransaction,
  mockPrismaGamificationResponses 
} from '../factories/gamification.factory';
import { PointTransactionType } from '@prisma/client';

describe('PointsService', () => {
  let pointsService: PointsService;
  const mockUser = createUser();
  const mockTransaction = createPointTransaction({ userId: mockUser.id });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance of the service for each test
    pointsService = new PointsService();
    
    // Mock Prisma responses
    mockPrismaGamificationResponses.pointTransaction.create.mockResolvedValue(mockTransaction);
    mockPrismaGamificationResponses.pointTransaction.findMany.mockResolvedValue([mockTransaction]);
    mockPrismaGamificationResponses.pointTransaction.aggregate.mockResolvedValue({
      _sum: { amount: mockTransaction.amount },
      _count: 1,
      _avg: { amount: mockTransaction.amount },
      _min: { amount: mockTransaction.amount },
      _max: { amount: mockTransaction.amount }
    });
  });

  describe('awardPoints', () => {
    it('should award points to a user', async () => {
      const points = 50;
      const type = PointTransactionType.LEARNING;
      const description = 'Completed a lesson';
      
      const result = await pointsService.awardPoints({
        userId: mockUser.id,
        points,
        type,
        description,
      });

      expect(mockPrismaGamificationResponses.pointTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          amount: points,
          type,
          description,
          metadata: {},
          expiresAt: expect.any(Date),
        },
      });
      
      expect(result).toEqual(mockTransaction);
    });

    it('should handle zero points gracefully', async () => {
      const result = await pointsService.awardPoints({
        userId: mockUser.id,
        points: 0,
        type: PointTransactionType.LEARNING,
        description: 'No points activity',
      });

      expect(result).toBeNull();
      expect(mockPrismaGamificationResponses.pointTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserPoints', () => {
    it('should get total points for a user', async () => {
      const result = await pointsService.getUserPoints(mockUser.id);
      
      expect(mockPrismaGamificationResponses.pointTransaction.aggregate).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        _sum: { amount: true },
      });
      
      expect(result).toBe(mockTransaction.amount);
    });

    it('should return 0 if no points found', async () => {
      mockPrismaGamificationResponses.pointTransaction.aggregate.mockResolvedValueOnce({
        _sum: { amount: null },
        _count: 0,
        _avg: { amount: null },
        _min: { amount: null },
        _max: { amount: null }
      });
      
      const result = await pointsService.getUserPoints('non-existent-user');
      expect(result).toBe(0);
    });
  });

  describe('getUserTransactions', () => {
    it('should get paginated transactions for a user', async () => {
      const page = 1;
      const limit = 10;
      
      const result = await pointsService.getUserTransactions(mockUser.id, { page, limit });
      
      expect(mockPrismaGamificationResponses.pointTransaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
      
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getLeaderboard', () => {
    it('should get the points leaderboard', async () => {
      const limit = 5;
      const mockLeaderboard = [
        { userId: 'user1', total: 1000 },
        { userId: 'user2', total: 900 },
      ];
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockLeaderboard);
      
      const result = await pointsService.getLeaderboard(limit);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`leaderboard:points:${limit}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `leaderboard:points:${limit}`,
        mockLeaderboard,
        300 // 5 minutes TTL
      );
      
      expect(result).toEqual(mockLeaderboard);
    });

    it('should return cached leaderboard if available', async () => {
      const limit = 5;
      const cachedLeaderboard = [
        { userId: 'user1', total: 1000, rank: 1 },
        { userId: 'user2', total: 900, rank: 2 },
      ];
      
      // Mock Redis cache hit
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedLeaderboard));
      
      const result = await pointsService.getLeaderboard(limit);
      
      // Verify Redis was checked and Prisma was not called
      expect(mockRedisService.get).toHaveBeenCalledWith(`leaderboard:points:${limit}`);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
      
      expect(result).toEqual(cachedLeaderboard);
    });
  });

  describe('getUserRank', () => {
    it('should get the rank of a user', async () => {
      const userRank = { rank: 42 };
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([userRank]);
      
      const result = await pointsService.getUserRank(mockUser.id);
      
      // Verify Redis was checked and the result was cached
      expect(mockRedisService.get).toHaveBeenCalledWith(`user:rank:${mockUser.id}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user:rank:${mockUser.id}`,
        userRank.rank,
        300 // 5 minutes TTL
      );
      
      expect(result).toBe(userRank.rank);
    });

    it('should return null if user has no points', async () => {
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValueOnce(null);
      
      // Mock Prisma raw query returning no results
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      
      const result = await pointsService.getUserRank('user-with-no-points');
      
      expect(result).toBeNull();
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });
  });
});
