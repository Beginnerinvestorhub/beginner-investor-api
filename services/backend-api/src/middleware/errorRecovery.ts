import type { Request, Response, NextFunction } from "express";
import { NudgeCacheService } from "../services/nudge/cache.service";
import logger from "../utils/logger";

const cacheService = new NudgeCacheService();

/**
 * Error recovery middleware that attempts to serve cached responses
 * when the primary service fails
 */
export const errorRecovery = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Only handle errors for nudge endpoint
  if (!req.originalUrl.includes("/api/nudge")) {
    return next(error);
  }

  const { message, context } = req.body;
  const userId = context?.userId;

  // Skip if we don't have enough information to attempt recovery
  if (!message || !userId) {
    return next(error);
  }

  logger.warn(
    `Attempting error recovery for failed nudge request from user ${userId}`,
  );

  try {
    // Try to get a cached response
    const cachedResponse = await cacheService.getCachedNudge(userId, message);

    if (cachedResponse) {
      logger.info("Serving from cache after error recovery", {
        userId,
        message: message.substring(0, 50) + "...", // Log first 50 chars
      });

      return res.status(200).json({
        nudge: JSON.parse(cachedResponse),
        cached: true,
        recovered: true,
      });
    }
  } catch (cacheError) {
    logger.error("Cache recovery failed:", {
      error: cacheError,
      userId,
      originalError: error.message,
    });
  }

  // If we get here, recovery wasn't possible
  logger.error("Error recovery failed, passing to error handler", {
    originalError: error.message,
    userId,
  });

  next(error);
};

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 404,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
};
