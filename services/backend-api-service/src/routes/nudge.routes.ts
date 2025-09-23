import { Router } from 'express';
import { nudgeController } from '../controllers/nudge.controller';
import { validateNudgeRequest } from '../validators/nudge.validator';
import { nudgeRateLimiter } from '../middleware/nudgeRateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Nudge
 *   description: AI-powered investment advice and nudges
 */

/**
 * @swagger
 * /api/nudge:
 *   post:
 *     summary: Get an AI-generated nudge
 *     description: Returns personalized investment advice based on user's message and context
 *     tags: [Nudge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's investment question or context
 *                 example: "Should I invest in tech stocks?"
 *                 minLength: 1
 *                 maxLength: 500
 *               context:
 *                 type: object
 *                 description: Additional context about the request
 *                 properties:
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                     description: Authenticated user ID
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   deviceInfo:
 *                     type: object
 *                     description: Information about the user's device
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [mobile, desktop, tablet]
 *                         description: Type of device
 *                         example: "mobile"
 *                       os:
 *                         type: string
 *                         description: Operating system information
 *                         example: "iOS 15.0"
 *     responses:
 *       200:
 *         description: Successful response with AI-generated nudge
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nudge:
 *                   type: string
 *                   description: AI-generated investment advice
 *                   example: "Based on current market trends, tech stocks show strong growth potential..."
 *                 cached:
 *                   type: boolean
 *                   description: Indicates if the response was served from cache
 *                   example: false
 *                 recovered:
 *                   type: boolean
 *                   description: Indicates if this is a recovered response after an error
 *                   example: false
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         example: "message"
 *                       message:
 *                         type: string
 *                         example: "Message is required"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         headers:
 *           X-RateLimit-Limit:
 *             schema:
 *               type: integer
 *               example: 10
 *             description: Request limit per window
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: integer
 *               example: 0
 *             description: Remaining requests in the current window
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Too many nudge requests. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique error ID for tracking
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "An unexpected error occurred"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/', nudgeRateLimiter, validateNudgeRequest, nudgeController.getNudge);

export default router;
