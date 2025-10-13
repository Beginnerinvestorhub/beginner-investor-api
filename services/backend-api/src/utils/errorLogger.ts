import { Request, Response } from "express";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Utility class for consistent error handling and logging
 */
export class ErrorLogger {
  /**
   * Logs an error with contextual information
   * @param error The error to log
   * @param req Optional Express request object
   * @param additionalInfo Additional context information
   * @returns A unique error ID for tracking
   */
  static logError(
    error: Error,
    req?: Request,
    additionalInfo: Record<string, any> = {},
  ): string {
    const errorId = uuidv4();
    const errorInfo: Record<string, any> = {
      errorId,
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...additionalInfo,
    };

    // Add request information if available
    if (req) {
      errorInfo.request = {
        method: req.method,
        url: req.originalUrl,
        path: req.path,
        params: req.params,
        query: req.query,
        headers: {
          "user-agent": req.get("user-agent"),
          referer: req.get("referer"),
          "x-forwarded-for": req.get("x-forwarded-for"),
        },
        ip: req.ip || req.connection.remoteAddress,
        body: req.body,
      };
    }

    // Log the error
    logger.error("Error occurred", errorInfo);
    return errorId;
  }

  /**
   * Creates a standardized error response
   * @param error The error to create a response for
   * @param req Optional Express request object
   * @returns A standardized error response object
   */
  static createErrorResponse(error: Error, req?: Request) {
    const errorId = this.logError(error, req);
    const isDevelopment = process.env.NODE_ENV === "development";

    // Handle custom API errors
    if (error instanceof ApiError) {
      return {
        error: {
          id: errorId,
          code: error.statusCode,
          message: error.message,
          ...(isDevelopment && { stack: error.stack }),
          ...(error.details && { details: error.details }),
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Handle unexpected errors
    return {
      error: {
        id: errorId,
        code: 500,
        message: "An unexpected error occurred",
        ...(isDevelopment && {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Express error handling middleware
   */
  static errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: Function,
  ) {
    const response = ErrorLogger.createErrorResponse(error, req);
    const statusCode = error instanceof ApiError ? error.statusCode : 500;

    // Log the error if it's a server error
    if (statusCode >= 500) {
      logger.error("Unhandled error:", {
        error: error.toString(),
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
      });
    }

    res.status(statusCode).json(response);
  }

  /**
   * Wrapper for async route handlers that automatically catches errors
   */
  static catchAsync(fn: Function) {
    return (req: Request, res: Response, next: Function) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        next(err);
      });
    };
  }
}
