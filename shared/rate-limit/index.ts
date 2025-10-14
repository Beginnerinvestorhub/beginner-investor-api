import { Request, Response, NextFunction } from 'express';
import { redisManager } from '../redis-client';
import { logger } from '../utils/logger';

type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the time window
  keyPrefix?: string; // Prefix for Redis keys
  message?: string; // Custom error message
  statusCode?: number; // HTTP status code for rate limit exceeded
  skip?: (req: Request) => boolean; // Function to skip rate limiting
};

const defaultConfig: Partial<RateLimitConfig> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyPrefix: 'rate_limit',
  message: 'Too many requests, please try again later.',
  statusCode: 429,
};

class RateLimiter {
  private static instance: RateLimiter;
  private config: Required<RateLimitConfig>;

  private constructor(config: RateLimitConfig) {
    this.config = { ...defaultConfig, ...config } as Required<RateLimitConfig>;
  }

  public static getInstance(
    config: RateLimitConfig = defaultConfig as RateLimitConfig
  ): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter(config);
    }
    return RateLimiter.instance;
  }

  /**
   * Create a rate limiter with custom configuration
   */
  public createRateLimiter = (config: RateLimitConfig) => {
    const limiter = new RateLimiter(config);
    return limiter.middleware();
  };

  // Default rate limiter (15 minutes, 100 requests)
  public defaultRateLimiter = this.createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyPrefix: 'api_rate_limit',
  });

  // Strict rate limiter (1 minute, 20 requests)
  public strictRateLimiter = this.createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: 'strict_rate_limit',
  });

  // Public API rate limiter (1 hour, 1000 requests)
  public publicApiRateLimiter = this.createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    keyPrefix: 'public_api_rate_limit',
  });

  // Service rate limiter (1 minute, 200 requests)
  public serviceRateLimiter = this.createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    keyPrefix: 'service_rate_limit',
    skip: (req: Request) => {
      // Skip rate limiting for internal service requests
      return req.headers['x-service-token'] === process.env.INTERNAL_SERVICE_SECRET;
    },
  });

  /**
   * Get a unique key for the rate limit
   */
  private getKey(req: Request): string {
    // Use IP address by default
    const identifier = req.ip || 'unknown';
    return `${this.config.keyPrefix}:${identifier}:${req.method}:${req.path}`;
  }

  /**
   * Middleware to handle rate limiting
   */
  public middleware(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Skip rate limiting if configured
        if (this.config.skip?.(req)) {
          return next();
        }

        const key = this.getKey(req);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        // Get all requests in the current window
        const client = redisManager.getClient();
        const requests = await client.zRangeByScore(key, windowStart, now);

        // Remove old requests
        await client.zRemRangeByScore(key, 0, windowStart - 1);

        // Check if rate limit is exceeded
        if (requests.length / 2 >= this.config.maxRequests) {
          const retryAfter =
            requests.length > 1
              ? Math.ceil((parseInt(requests[1]) + this.config.windowMs - now) / 1000)
              : Math.ceil(this.config.windowMs / 1000);

          res.setHeader('Retry-After', retryAfter);
          res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());

          res.status(this.config.statusCode).json({
            error: 'Too Many Requests',
            message: this.config.message,
            retryAfter: `${retryAfter} seconds`,
          });
          return;
        }

        // Add current request to the sorted set
        await client.zAdd(key, { score: now, value: now.toString() });

        // Set TTL for the key
        await client.expire(key, Math.ceil(this.config.windowMs / 1000));

        // Set response headers
        const remaining = Math.max(0, this.config.maxRequests - requests.length / 2 - 1);
        res.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(now + this.config.windowMs).toISOString());

        next();
      } catch (error) {
        logger.error('Rate limit error:', error);
        // In case of Redis failure, allow the request to proceed
        next();
      }
    };
  }
}

// Create a singleton instance
const rateLimiter = RateLimiter.getInstance();

// Export the singleton and createRateLimiter function
export { rateLimiter, RateLimiter };

export default rateLimiter;
