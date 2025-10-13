import request from "supertest";
import { app } from "../../../app";
import { RedisService } from "../../services/redis/redis.service";
import { NudgeCacheService } from "../../services/nudge/cache.service";
import { logger } from "../../utils/logger";

// Mock the logger to avoid cluttering test output
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("Nudge Engine API Integration Tests", () => {
  let redis: RedisService;
  let cacheService: NudgeCacheService;
  const testUserId = "test-user-123";
  const testMessage = "Should I invest in tech stocks?";

  beforeAll(async () => {
    redis = RedisService.getInstance();
    cacheService = new NudgeCacheService();

    // Ensure we have a clean state
    await redis.flushAll();
  });

  afterEach(async () => {
    // Clean up after each test
    await redis.flushAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close Redis connection
    await redis.quit();
  });

  describe("POST /api/nudge", () => {
    it("should return 400 for invalid request body", async () => {
      const response = await request(app)
        .post("/api/nudge")
        .send({ invalid: "request" })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toBeDefined();
    });

    it("should return 200 with a nudge for a valid request", async () => {
      const response = await request(app)
        .post("/api/nudge")
        .send({
          message: testMessage,
          context: { userId: testUserId },
        })
        .expect(200);

      expect(response.body).toHaveProperty("nudge");
      expect(typeof response.body.nudge).toBe("string");
    });

    it("should return a cached response if available", async () => {
      // Prime the cache
      const cachedResponse = "This is a cached response";
      await cacheService.cacheNudge(
        testUserId,
        testMessage,
        JSON.stringify({ nudge: cachedResponse }),
      );

      const response = await request(app)
        .post("/api/nudge")
        .send({
          message: testMessage,
          context: { userId: testUserId },
        })
        .expect(200);

      expect(response.body.nudge).toBe(cachedResponse);
    });

    it("should return 429 when rate limit is exceeded", async () => {
      // Mock rate limiter to immediately exceed limit
      const rateLimitKey = `nudge_limit:${testUserId}`;
      await redis.set(rateLimitKey, "11", "EX", 60);

      const response = await request(app)
        .post("/api/nudge")
        .send({
          message: testMessage,
          context: { userId: testUserId },
        })
        .expect(429);

      expect(response.body.error).toContain("Too many nudge requests");
    });

    it("should handle service errors gracefully", async () => {
      // Mock a service failure
      jest
        .spyOn(cacheService, "getCachedNudge")
        .mockRejectedValueOnce(new Error("Cache error"));

      const response = await request(app)
        .post("/api/nudge")
        .send({
          message: testMessage,
          context: { userId: testUserId },
        })
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("Error Recovery", () => {
    it("should serve cached response when primary service fails", async () => {
      const cachedResponse = "Fallback cached response";
      await cacheService.cacheNudge(
        testUserId,
        testMessage,
        JSON.stringify({ nudge: cachedResponse }),
      );

      // Mock a service failure
      jest
        .spyOn(cacheService, "getCachedNudge")
        .mockRejectedValueOnce(new Error("Service unavailable"));

      const response = await request(app)
        .post("/api/nudge")
        .send({
          message: testMessage,
          context: { userId: testUserId },
        })
        .expect(200);

      expect(response.body.nudge).toBe(cachedResponse);
      expect(response.body.cached).toBe(true);
    });
  });
});
