import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// --- TYPE DEFINITIONS ---

// Extend the Request interface to include the authenticated user object
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    // Add other user properties as needed (e.g., email, roles)
  };
}

// Interface for the AI-generated nudge request body
interface AiNudgeRequestBody {
  message: string;
  context?: any; // Context can be any object structure for now
}

// Interface for the Create Nudge request body
interface CreateNudgeRequestBody {
    userId: string;
    message: string;
    // Define other properties for a new nudge record here
}


// --- CONTROLLER FUNCTIONS ---

/**
 * Get all nudges for a user
 * Route: GET /api/nudges or GET /api/nudges/:userId
 */
export const getNudges = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Priority: 1. User ID from route params, 2. Authenticated User ID
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      // Use the logger for better error tracking
      logger.warn('Attempted getNudges without User ID.');
      res.status(400).json({
        error: 'User ID is required from path parameters or authentication context.',
      });
      return;
    }

    // TODO: Implement actual nudge fetching logic
    // const nudges = await nudgeService.getNudgesForUser(userId);

    res.status(200).json({
      message: 'Nudges retrieved successfully',
      data: [],
      // data: nudges,
    });
  } catch (error) {
    logger.error('Error in getNudges:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Get a specific nudge by ID
 * Route: GET /api/nudges/id/:id
 */
export const getNudgeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: 'Nudge ID is required in the path parameters.',
      });
      return;
    }

    // TODO: Implement actual nudge fetching logic
    // const nudge = await nudgeService.getNudgeById(id);

    // FIX: Check if the resource was actually found
    // if (!nudge) {
    //   res.status(404).json({ error: 'Nudge not found.' });
    //   return;
    // }

    res.status(200).json({
      message: 'Nudge retrieved successfully',
      data: null,
      // data: nudge,
    });
  } catch (error) {
    logger.error('Error in getNudgeById:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Get an AI-generated nudge based on user input (The POST endpoint logic)
 * Route: POST /api/nudge
 */
export const getNudge = async (
  // Use the specific body interface here for better type checking
  req: Request<{}, {}, AiNudgeRequestBody> & AuthenticatedRequest, 
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // The request body has already been validated by middleware (as seen in previous turns)
    const { message, context } = req.body;
    const userId = req.user?.id; // Use this for personalization

    if (!message) {
      // This check is redundant if you have validation middleware, but harmless.
      res.status(400).json({
        error: 'Message is required in the request body.',
      });
      return;
    }

    // FIX: Prefix unused variables with an underscore for clarity and to prevent TS warnings
    const _context = context; 

    // TODO: Implement actual AI nudge generation logic
    // const aiResponse = await aiService.generateNudge(message, userId, _context);

    // For now, return a placeholder response
    const nudge = `Based on your query: "${message}", here's some personalized advice.`;

    res.status(200).json({
      nudge,
      cached: false,
      recovered: false,
    });
  } catch (error) {
    logger.error('Error in getNudge (AI Generation):', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Create a new nudge (e.g., system-generated or saved AI nudge)
 * Route: POST /api/nudges
 */
export const createNudge = async (
  // Use the specific body interface here for better type checking
  req: Request<{}, {}, CreateNudgeRequestBody> & AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const nudgeData = req.body;
    
    // Better check: check for a required field instead of just the object presence
    if (!nudgeData || !nudgeData.userId) { 
      res.status(400).json({
        error: 'Nudge data (including userId) is required.',
      });
      return;
    }

    // TODO: Implement actual nudge creation logic
    // const newNudge = await nudgeService.createNudge(nudgeData);

    res.status(201).json({
      message: 'Nudge created successfully',
      data: nudgeData, // Placeholder for the new nudge object
      // data: newNudge,
    });
  } catch (error) {
    logger.error('Error in createNudge:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Update an existing nudge
 * Route: PUT /api/nudges/:id
 */
export const updateNudge = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        error: 'Nudge ID is required in the path parameters.',
      });
      return;
    }

    // TODO: Implement actual nudge update logic
    // const updatedNudge = await nudgeService.updateNudge(id, updateData);

    // FIX: Check if the resource was actually updated (e.g., ensure it exists)
    // if (!updatedNudge) {
    //   res.status(404).json({ error: 'Nudge not found or no changes made.' });
    //   return;
    // }

    res.status(200).json({
      message: 'Nudge updated successfully',
      data: { id, ...updateData },
      // data: updatedNudge,
    });
  } catch (error) {
    logger.error('Error in updateNudge:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Delete a nudge
 * Route: DELETE /api/nudges/:id
 */
export const deleteNudge = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: 'Nudge ID is required in the path parameters.',
      });
      return;
    }

    // TODO: Implement actual nudge deletion logic
    // const deletedCount = await nudgeService.deleteNudge(id);

    // FIX: Check if the resource was deleted
    // if (deletedCount === 0) {
    //    res.status(404).json({ error: 'Nudge not found.' });
    //    return;
    // }

    res.status(200).json({
      message: 'Nudge deleted successfully',
    });
  } catch (error) {
    logger.error('Error in deleteNudge:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Mark a nudge as viewed/dismissed
 * Route: POST /api/nudges/:id/view
 */
export const markNudgeAsViewed = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: 'Nudge ID is required in the path parameters.',
      });
      return;
    }

    // TODO: Implement actual nudge view tracking logic
    // await nudgeService.markAsViewed(id);

    res.status(200).json({
      message: 'Nudge marked as viewed',
    });
  } catch (error) {
    logger.error('Error in markNudgeAsViewed:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------

/**
 * Get nudge statistics for a user
 * Route: GET /api/nudges/stats or GET /api/nudges/:userId/stats
 */
export const getNudgeStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      res.status(400).json({
        error: 'User ID is required from path parameters or authentication context.',
      });
      return;
    }

    // TODO: Implement actual stats fetching logic
    // const stats = await nudgeService.getStatsForUser(userId);

    res.status(200).json({
      message: 'Nudge statistics retrieved successfully',
      data: {
        total: 0,
        viewed: 0,
        dismissed: 0,
        active: 0,
      },
      // data: stats,
    });
  } catch (error) {
    logger.error('Error in getNudgeStats:', error);
    next(error);
  }
};