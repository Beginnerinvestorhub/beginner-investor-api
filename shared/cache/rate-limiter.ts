import { CacheManager } from './cache-manager';
import { CacheKeys } from './cache-keys';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private cacheManager: CacheManager;

  constructor() {
    this.cacheManager = new CacheManager();
  }

  async check(
    req: any,
    options: RateLimitOptions
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    const key = options.keyGenerator ? options.keyGenerator(req) : this.defaultKeyGenerator(req);

    const now = Date.now();
    const windowStart = now - options.windowMs;
    const cacheKey = CacheKeys.rateLimit.user(key, 'requests');

    try {
      // Get current request count for this window
      const requests = (await this.cacheManager.get<number[]>(cacheKey)) || [];

      // Filter requests within the current window
      const validRequests = requests.filter((timestamp) => timestamp > windowStart);

      if (validRequests.length >= options.maxRequests) {
        return {
          success: false,
          limit: options.maxRequests,
          remaining: 0,
          resetTime: validRequests[0] + options.windowMs,
        };
      }

      // Add current request
      validRequests.push(now);

      // Update cache with new request count
      await this.cacheManager.set(cacheKey, validRequests, {
        ttl: Math.ceil(options.windowMs / 1000),
      });

      return {
        success: true,
        limit: options.maxRequests,
        remaining: options.maxRequests - validRequests.length,
        resetTime: validRequests[0] + options.windowMs,
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fallback: allow request if Redis is down
      return {
        success: true,
        limit: options.maxRequests,
        remaining: options.maxRequests - 1,
        resetTime: now + options.windowMs,
      };
    }
  }

  private defaultKeyGenerator(req: any): string {
    // Use IP address as default key
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  // Middleware factory for Express.js
  createMiddleware(options: RateLimitOptions) {
    return async (req: any, res: any, next: any) => {
      const result = await this.check(req, options);

      res.set({
        'X-RateLimit-Limit': result.limit,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': result.resetTime,
      });

      if (!result.success) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        });
      }

      next();
    };
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  MARKET_DATA: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  AI_ENGINE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
};
