import type { Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import type {
  AuthenticatedRequest,
  AiNudgeRequest,
  CreateNudgeRequest,
  NudgeResponse,
  AiNudgeResponse,
  ErrorResponse,
  PaginationParams,
  PaginatedResponse,
} from "../types/nudge.types";

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper function to validate IDs
const validateId = (id: string | undefined): string => {
  if (!id) {
    throw new ApiError(400, "ID is required", "MISSING_ID");
  }
  // Add more ID validation if needed (e.g., UUID format)
  return id;
};

// --- CONTROLLER FUNCTIONS ---

/**
 * Get all nudges for a user
 * Route: GET /api/nudges or GET /api/nudges/:userId
 */
export const getNudges = async (
  req: AuthenticatedRequest,
  res: Response<PaginatedResponse<NudgeResponse> | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      throw new ApiError(400, "User ID is required", "MISSING_USER_ID", {
        source: req.params.userId ? "params" : "auth",
      });
    }

    // TODO: Implement pagination
    const pagination: PaginationParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
    };

    // TODO: Implement actual nudge fetching logic
    // const { data, total } = await nudgeService.getNudgesForUser(userId, pagination);

    res.status(200).json({
      data: [], // Replace with actual data
      pagination: {
        total: 0, // Replace with actual total
        page: pagination.page,
        limit: pagination.limit,
        totalPages: 1, // Replace with actual total pages
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific nudge by ID
 * Route: GET /api/nudges/:id
 */
export const getNudgeById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<NudgeResponse | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = validateId(req.params.id);

    // TODO: Implement actual nudge fetching logic
    // const nudge = await nudgeService.getNudgeById(id);
    // if (!nudge) {
    //   throw new ApiError(404, 'Nudge not found', 'NOT_FOUND');
    // }

    res.status(200).json({
      id,
      userId: req.user?.id || "system",
      message: "Sample nudge message",
      type: "info",
      priority: "medium",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get an AI-generated nudge
 * Route: POST /api/nudge
 */
export const getNudge = async (
  req: AuthenticatedRequest<{}, {}, AiNudgeRequest>,
  res: Response<AiNudgeResponse | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { message, context } = req.body;
    const userId = req.user?.id;

    // TODO: Implement actual AI nudge generation
    // const nudge = await aiService.generateNudge(message, { userId, ...context });

    res.status(200).json({
      nudge: `AI Response to: ${message}`,
      cached: false,
      recovered: false,
      metadata: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new nudge
 * Route: POST /api/nudges
 */
export const createNudge = async (
  req: AuthenticatedRequest<{}, {}, CreateNudgeRequest>,
  res: Response<NudgeResponse | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const nudgeData = req.body;

    // TODO: Implement actual nudge creation
    // const newNudge = await nudgeService.createNudge({
    //   ...nudgeData,
    //   createdBy: req.user?.id || 'system',
    // });

    res.status(201).json({
      id: uuidv4(),
      userId: nudgeData.userId,
      message: nudgeData.message,
      type: nudgeData.type || "info",
      priority: nudgeData.priority || "medium",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing nudge
 * Route: PUT /api/nudges/:id
 */
export const updateNudge = async (
  req: AuthenticatedRequest<{ id: string }, {}, Partial<CreateNudgeRequest>>,
  res: Response<NudgeResponse | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = validateId(req.params.id);
    const updateData = req.body;

    // TODO: Implement actual update logic
    // const updatedNudge = await nudgeService.updateNudge(id, updateData);

    res.status(200).json({
      id,
      userId: updateData.userId || "system",
      message: updateData.message || "Updated nudge message",
      type: updateData.type || "info",
      priority: updateData.priority || "medium",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a nudge
 * Route: DELETE /api/nudges/:id
 */
export const deleteNudge = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<{ success: boolean; message: string } | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = validateId(req.params.id);

    // TODO: Implement actual delete logic
    // await nudgeService.deleteNudge(id);

    res.status(200).json({
      success: true,
      message: "Nudge deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a nudge as viewed
 * Route: POST /api/nudges/:id/view
 */
export const markNudgeAsViewed = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<{ success: boolean; message: string } | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = validateId(req.params.id);

    // TODO: Implement actual view marking logic
    // await nudgeService.markAsViewed(id, req.user?.id);

    res.status(200).json({
      success: true,
      message: "Nudge marked as viewed",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nudge statistics
 * Route: GET /api/nudges/stats
 */
export const getNudgeStats = async (
  req: AuthenticatedRequest,
  res: Response<Record<string, unknown> | ErrorResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      throw new ApiError(400, "User ID is required", "MISSING_USER_ID");
    }

    // TODO: Implement actual statistics logic
    // const stats = await nudgeService.getNudgeStats(userId);

    res.status(200).json({
      totalNudges: 0,
      readNudges: 0,
      unreadNudges: 0,
      // ...other stats
    });
  } catch (error) {
    next(error);
  }
};

// Error handling middleware (should be registered in your Express app)
export const errorHandler = (
  err: Error,
  _req: AuthenticatedRequest,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void => {
  logger.error("Error in nudge controller:", err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code || "API_ERROR",
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle other types of errors
  const errorId = uuidv4();
  logger.error(`[${errorId}] Unhandled error:`, err);

  res.status(500).json({
    error: {
      id: errorId,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    },
  });
};
