import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";

// Request body type
export type NudgeRequest = {
  message: string;
  context?: {
    userId?: string;
    deviceInfo?: {
      type?: "mobile" | "desktop" | "tablet";
      os?: string;
    };
  };
};

// Enhanced validation schema with better type inference
const nudgeRequestSchema = z.object({
  message: z
    .string({
      required_error: "Message is required",
      invalid_type_error: "Message must be a string",
    })
    .min(1, "Message cannot be empty")
    .max(500, "Message cannot exceed 500 characters")
    .regex(
      /^[\w\s\d.,!?@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
      "Contains invalid characters",
    ),
  context: z
    .object({
      userId: z
        .string({ required_error: "User ID is required in context" })
        .uuid("Invalid UUID format for user ID"),
      deviceInfo: z
        .object({
          type: z
            .enum(["mobile", "desktop", "tablet"], {
              invalid_type_error:
                "Device type must be mobile, desktop, or tablet",
            })
            .optional(),
          os: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type NudgeRequestValidation = z.infer<typeof nudgeRequestSchema>;

/**
 * Validates the nudge request body with proper error handling
 */
export const validateNudgeRequest = (
  req: Request<{}, {}, NudgeRequest>,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const validationResult = nudgeRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: "VALIDATION_ERROR",
      }));

      logger.warn("Nudge validation failed", { errors });

      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Validation failed",
          details: errors,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Type-safe validated data
    req.body = validationResult.data as NudgeRequest;
    next();
  } catch (error) {
    logger.error("Unexpected error in validateNudgeRequest", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during validation",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export default {
  validateNudgeRequest,
};
