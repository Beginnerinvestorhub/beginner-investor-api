import { Router } from "express";
import { nudgeRateLimiter } from "../middleware/nudgeRateLimiter";
import {
  cacheMiddleware,
  CacheInvalidator,
} from "../middleware/cache.middleware";
import { validateNudgeRequest } from "../validators/nudge.validator";
import { getNudge } from "../controllers/nudge.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 * name: Nudge
 * description: AI-powered investment advice and nudges
 */

/**
 * @swagger
 * /api/nudge:
 * post:
 * summary: Get an AI-generated nudge
 * description: Returns personalized investment advice based on user's message and context
 * tags: [Nudge]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - message
 * properties:
 * message:
 * type: string
 * description: User's investment question or context
 * example: "Should I invest in tech stocks?"
 * minLength: 1
 * maxLength: 500
 * context:
 * type: object
 * description: Additional context about the request
 * properties:
 * userId:
 * type: string
 * format: uuid
 * description: Authenticated user ID
 * example: "123e4567-e89b-12d3-a456-426614174000"
 * deviceInfo:
 * type: object
 * description: Information about the user's device
 * properties:
 * type:
 * type: string
 * enum: [mobile, desktop, tablet]
 * description: Type of device
 * example: "mobile"
 * os:
 * type: string
 * description: Operating system information
 * example: "iOS 15.0"
 * responses:
 * 200:
 * description: Successful response with AI-generated nudge
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nudge:
 * type: string
 * description: AI-generated investment advice
 * example: "Based on current market trends, tech stocks show strong growth potential..."
 * cached:
 * type: boolean
 * description: Indicates if the response was served from cache
 * example: false
 * recovered:
 * type: boolean
 * description: Indicates if this is a recovered response after an error
 * example: false
 * 400:
 * description: Invalid input data
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Validation failed"
 * details:
 * type: array
 * items:
 * type: object
 * properties:
 * path:
 * type: string
 * example: "message"
 * message:
 * type: string
 * example: "Message is required"
 * 401:
 * description: Unauthorized - Missing or invalid authentication
 * 429:
 * description: Too many requests - Rate limit exceeded
 * headers:
 * X-RateLimit-Limit:
 * schema:
 * type: integer
 * example: 10
 * description: Request limit per window
 * X-RateLimit-Remaining:
 * schema:
 * type: integer
 * example: 0
 * description: Remaining requests in the current window
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Too many nudge requests. Please try again later."
 * 500:
 * description: Internal server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: object
 * properties:
 * id:
 * type: string
 * format: uuid
 * description: Unique error ID for tracking
 * example: "5d01a3c6-9f7e-4b8c-b6a2-2b621e2e1a3d"
 * code:
 * type: integer
 * example: 500
 * message:
 * type: string
 * example: "An unexpected error occurred"
 * timestamp:
 * type: string
 * format: date-time
 */
router.post(
  "/",
  authenticate(),
  // nudgeRateLimiter,
  // cacheMiddleware({ ttl: 300, includeUserId: true }),
  validateNudgeRequest,
  getNudge,
);

/**
 * @swagger
 * /api/nudge/cache/invalidate:
 * post:
 * summary: Invalidate nudge cache
 * description: Clears cached nudge responses for the authenticated user
 * tags: [Nudge]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Cache invalidated successfully
 * 401:
 * description: Unauthorized - Missing or invalid authentication
 */
router.post("/cache/invalidate", authenticate(), async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // await CacheInvalidator.invalidateUserCache(userId, "api");
    res.json({ message: "Cache temporarily disabled" });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
