import { Request, Response, NextFunction } from 'express';
import { rateLimiter, RATE_LIMITS, RateLimitOptions } from '../../../shared/cache/rate-limiter';
import logger from '../utils/logger';

/**
 * Generic rate limiting middleware factory
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await rateLimiter.check(req, options);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString()
      });

      if (!result.success) {
        logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // Fail open to ensure service availability
      next();
    }
  };
}

/**
 * API rate limiting middleware (100 requests per 15 minutes)
 */
export const apiRateLimit = createRateLimitMiddleware(RATE_LIMITS.API);

/**
 * Authentication rate limiting middleware (5 requests per 15 minutes)
 */
export const authRateLimit = createRateLimitMiddleware(RATE_LIMITS.AUTH);

/**
 * Market data rate limiting middleware (30 requests per minute)
 */
export const marketDataRateLimit = createRateLimitMiddleware(RATE_LIMITS.MARKET_DATA);

/**
 * AI engine rate limiting middleware (10 requests per minute)
 */
export const aiEngineRateLimit = createRateLimitMiddleware(RATE_LIMITS.AI_ENGINE);

/**
 * Custom rate limiting middleware for specific use cases
 */
export function customRateLimit(options: RateLimitOptions) {
  return createRateLimitMiddleware(options);
}
