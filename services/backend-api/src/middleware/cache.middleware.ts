import { Request, Response, NextFunction } from "express";
import { getCacheManager } from "../../../shared/cache/init.js";
import logger from "../utils/logger";

/**
 * Cache middleware configuration
 */
export interface CacheMiddlewareOptions {
  ttl?: number; // Time to live in seconds (default: 300)
  keyGenerator?: (req: Request) => string; // Custom key generation
  namespace?: string; // Cache namespace
  includeUserId?: boolean; // Include authenticated user ID in cache key
  excludeHeaders?: string[]; // Headers to exclude from cache key
  includeQuery?: boolean; // Include query parameters in cache key
  includeBody?: boolean; // Include request body in cache key (use carefully)
}

/**
 * Default cache key generator
 */
function defaultCacheKeyGenerator(
  req: Request,
  options: CacheMiddlewareOptions,
): string {
  const parts = [req.method, req.path];

  // Add user ID if authenticated and requested
  if (options.includeUserId && req.user?.uid) {
    parts.push(`user:${req.user.uid}`);
  }

  // Add query parameters if requested
  if (options.includeQuery && req.query) {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map((key) => `${key}:${req.query[key]}`)
      .join("|");
    if (sortedQuery) {
      parts.push(`query:${sortedQuery}`);
    }
  }

  // Add request body if requested (for POST/PUT requests)
  if (
    options.includeBody &&
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    req.body
  ) {
    // Create a hash of the body to avoid extremely long cache keys
    const bodyHash = Buffer.from(JSON.stringify(req.body)).toString("base64");
    parts.push(`body:${bodyHash}`);
  }

  return parts.join(":");
}

/**
 * Cache middleware factory
 */
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultCacheKeyGenerator,
    namespace = "api",
    includeUserId = false,
    excludeHeaders = ["authorization", "cookie"],
    includeQuery = true,
    includeBody = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if this is a GET request (only cache GET requests by default)
      if (req.method !== "GET") {
        return next();
      }

      const cacheKey = keyGenerator(req, options);

      // Try to get from cache
      const cachedResponse = await getCacheManager().get(cacheKey, {
        namespace,
      });

      if (cachedResponse) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        // Set cache headers
        res.set({
          "X-Cache": "HIT",
          "X-Cache-TTL": ttl.toString(),
        });

        return res.json(cachedResponse);
      }

      // Cache miss - capture response
      logger.debug(`Cache miss for key: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function (body: unknown) {
        // Only cache successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          getCacheManager()
            .set(cacheKey, body, {
              ttl,
              namespace,
            })
            .catch((error) => {
              logger.error("Failed to cache response:", error);
            });
        }

        // Set cache headers for new response
        res.set({
          "X-Cache": "MISS",
          "X-Cache-TTL": ttl.toString(),
        });

        // Call original json method
        return originalJson.call(this, body);
      };

      next();
    } catch (error: unknown) {
      logger.error("Cache middleware error:", error);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Cache invalidation utility
 */
export class CacheInvalidator {
  /**
   * Invalidate cache by pattern
   */
  static async invalidatePattern(
    pattern: string,
    namespace?: string,
  ): Promise<void> {
    try {
      await getCacheManager().deletePattern(pattern, { namespace });
      logger.info(`Invalidated cache pattern: ${pattern}`);
    } catch (error: unknown) {
      logger.error("Failed to invalidate cache pattern:", error);
    }
  }

  /**
   * Invalidate user-specific cache
   */
  static async invalidateUserCache(
    userId: string,
    namespace?: string,
  ): Promise<void> {
    const pattern = `*user:${userId}*`;
    await this.invalidatePattern(pattern, namespace);
  }

  /**
   * Invalidate all cache for a specific endpoint
   */
  static async invalidateEndpointCache(
    endpoint: string,
    namespace?: string,
  ): Promise<void> {
    const pattern = `*${endpoint}*`;
    await this.invalidatePattern(pattern, namespace);
  }

  /**
   * Clear all cache
   */
  static async clearAll(namespace?: string): Promise<void> {
    try {
      await getCacheManager().flushAll();
      logger.info("Cleared all cache");
    } catch (error: unknown) {
      logger.error("Failed to clear cache:", error);
    }
  }
}
