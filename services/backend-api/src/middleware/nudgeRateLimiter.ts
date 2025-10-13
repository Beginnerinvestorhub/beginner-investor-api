import type { Request, Response, NextFunction } from "express";
import { RedisService } from "../services/redis/redis.service";
import logger from "../utils/logger";
import type { RedisClientType } from "redis";

const RATE_LIMIT = 10; // 10 requests
const WINDOW_SECONDS = 60; // per minute

/**
 * Rate limiting middleware specifically for the nudge endpoint
 * Uses Redis to track request counts per client
 * @param req Express request object
 * @param res Express response object
 * @param next Next function in the middleware chain
 */
export const nudgeRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientId = req.user?.uid || req.ip; // Use authenticated user ID or IP
  const key = `nudge_limit:${clientId}`;
  const redis = RedisService.getInstance() as unknown as RedisClientType;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const remaining = Math.max(0, RATE_LIMIT - current);
    res.set("X-RateLimit-Limit", RATE_LIMIT.toString());
    res.set("X-RateLimit-Remaining", remaining.toString());

    if (current > RATE_LIMIT) {
      logger.warn(`Rate limit exceeded for ${clientId} on nudge endpoint`);
      return res.status(429).json({
        error: "Too many nudge requests. Please try again later.",
      });
    }
    next();
  } catch (error) {
    logger.error("Rate limiter error:", error);
    next(); // Fail open to ensure service availability
  }
};
