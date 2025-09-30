import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Schema for validating nudge requests
 */
export const nudgeRequestSchema = z.object({
    message: z.string()
        .min(1, 'Message is required')
        .max(500, 'Message too long (max 500 characters)')
        .regex(/^[a-zA-Z0-9\s.,!?]+$/, 'Invalid characters in message'),
    context: z.object({
        userId: z.string().uuid('Invalid user ID format'),
        deviceInfo: z.object({
            type: z.enum(['mobile', 'desktop', 'tablet']).optional(),
            os: z.string().optional()
        }).optional()
    }).optional()
});

/**
 * Middleware to validate nudge requests using Zod schema
 * @param req Express request object
 * @param res Express response object
 * @param next Next function in the middleware chain
 */
export const validateNudgeRequest = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body against the schema
        nudgeRequestSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};

// Export types for TypeScript inference
export type NudgeRequest = z.infer<typeof nudgeRequestSchema>;
