import type { Request } from "express";

// User type from authentication
export interface AuthUser {
  id: string;
  email?: string;
  roles?: string[];
  // Add other user properties as needed
}

// Extended Request type with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Request body for AI nudge generation
export interface AiNudgeRequest {
  message: string;
  context?: {
    userId?: string;
    deviceInfo?: {
      type?: "mobile" | "desktop" | "tablet";
      os?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Request body for creating a nudge
export interface CreateNudgeRequest {
  userId: string;
  message: string;
  type?: string;
  priority?: "low" | "medium" | "high";
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Nudge response type
export interface NudgeResponse {
  id: string;
  userId: string;
  message: string;
  type: string;
  priority: "low" | "medium" | "high";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// AI Nudge Response
export interface AiNudgeResponse {
  nudge: string;
  cached: boolean;
  recovered: boolean;
  metadata?: Record<string, unknown>;
}

// Error response type
export interface ErrorResponse {
  error: {
    id?: string;
    code: number;
    message: string;
    details?: Array<{
      path: string;
      message: string;
    }>;
    timestamp?: string;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
