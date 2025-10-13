import { RedisService } from "../redis/redis.service";
import { logger } from "../../utils/logger";

const CACHE_TTL = 300; // 5 minutes

/**
 * Service for caching nudge responses in Redis
 */
export class NudgeCacheService {
  private redis = RedisService.getInstance();
  private prefix = "nudge:";

  /**
   * Get a cached nudge response
   * @param userId The ID of the user making the request
   * @param message The message to get a cached response for
   * @returns Cached response string or null if not found
   */
  async getCachedNudge(
    userId: string,
    message: string,
  ): Promise<string | null> {
    const key = this.getCacheKey(userId, message);
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.error("Cache read error:", error);
      return null;
    }
  }

  /**
   * Cache a nudge response
   * @param userId The ID of the user making the request
   * @param message The message being responded to
   * @param response The response to cache
   */
  async cacheNudge(
    userId: string,
    message: string,
    response: string,
  ): Promise<void> {
    const key = this.getCacheKey(userId, message);
    try {
      await this.redis.set(key, response, "EX", CACHE_TTL);
    } catch (error) {
      logger.error("Cache write error:", error);
    }
  }

  /**
   * Generate a cache key from user ID and message
   * @param userId The ID of the user
   * @param message The message content
   * @returns A formatted cache key
   */
  private getCacheKey(userId: string, message: string): string {
    // Normalize message to create consistent cache keys
    const normalizedMessage = message.trim().toLowerCase();
    return `${this.prefix}${userId}:${Buffer.from(normalizedMessage).toString("base64")}`;
  }
}
