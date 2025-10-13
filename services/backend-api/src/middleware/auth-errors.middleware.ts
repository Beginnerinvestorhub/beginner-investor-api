import type { Request, Response, NextFunction } from "express";
import {
  AuthenticationError,
  AuthErrorCode,
} from "d:/beginnerinvestorhub/shared/auth/auth.types.js";

/**
 * Format authentication errors into a consistent structure
 */
export function formatAuthErrors(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  // This middleware can be used to transform errors before they reach the error handler
  next();
}

/**
 * Authentication error handler middleware
 * Handles all authentication-related errors
 */
export function authErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  // Handle AuthenticationError instances
  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && {
        details: err.details,
        stack: err.stack,
      }),
    });
  }

  // Handle Firebase Auth errors
  if (err.code && err.code.startsWith("auth/")) {
    const statusCode = mapFirebaseErrorToStatus(err.code);
    return res.status(statusCode).json({
      status: "error",
      code: err.code,
      message: mapFirebaseErrorMessage(err.code),
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
      }),
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      code: AuthErrorCode.INVALID_TOKEN,
      message: "Invalid authentication token",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
      }),
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      code: AuthErrorCode.TOKEN_EXPIRED,
      message: "Authentication token has expired",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
      }),
    });
  }

  // Handle standard unauthorized errors
  if (err.name === "UnauthorizedError" || err.statusCode === 401) {
    return res.status(401).json({
      status: "error",
      code: AuthErrorCode.UNAUTHORIZED,
      message: "Unauthorized access",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
      }),
    });
  }

  // Handle forbidden errors
  if (err.statusCode === 403) {
    return res.status(403).json({
      status: "error",
      code: AuthErrorCode.FORBIDDEN,
      message: "Access forbidden",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
      }),
    });
  }

  // If not an auth error, pass to next error handler
  next(err);
}

/**
 * Map Firebase error codes to HTTP status codes
 */
function mapFirebaseErrorToStatus(firebaseCode: string): number {
  const errorMap: Record<string, number> = {
    "auth/invalid-credential": 401,
    "auth/user-not-found": 401,
    "auth/wrong-password": 401,
    "auth/invalid-email": 400,
    "auth/email-already-in-use": 409,
    "auth/weak-password": 400,
    "auth/user-disabled": 403,
    "auth/too-many-requests": 429,
    "auth/operation-not-allowed": 403,
    "auth/account-exists-with-different-credential": 409,
    "auth/invalid-verification-code": 400,
    "auth/invalid-verification-id": 400,
    "auth/expired-action-code": 400,
    "auth/invalid-action-code": 400,
  };

  return errorMap[firebaseCode] || 500;
}

/**
 * Map Firebase error codes to user-friendly messages
 */
function mapFirebaseErrorMessage(firebaseCode: string): string {
  const messageMap: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/invalid-email": "Invalid email address",
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/weak-password": "Password is too weak",
    "auth/user-disabled": "This account has been disabled",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later",
    "auth/operation-not-allowed": "This operation is not allowed",
    "auth/account-exists-with-different-credential":
      "An account already exists with a different sign-in method",
    "auth/invalid-verification-code": "Invalid verification code",
    "auth/invalid-verification-id": "Invalid verification ID",
    "auth/expired-action-code": "This verification link has expired",
    "auth/invalid-action-code": "This verification link is invalid",
  };

  return messageMap[firebaseCode] || "Authentication error occurred";
}

/**
 * Create an authentication error
 */
export function createAuthError(
  code: AuthErrorCode,
  message?: string,
  statusCode?: number,
  details?: any,
): AuthenticationError {
  const defaultMessages: Record<AuthErrorCode, string> = {
    [AuthErrorCode.INVALID_TOKEN]: "Invalid authentication token",
    [AuthErrorCode.TOKEN_EXPIRED]: "Authentication token has expired",
    [AuthErrorCode.UNAUTHORIZED]: "Unauthorized access",
    [AuthErrorCode.FORBIDDEN]: "Access forbidden",
    [AuthErrorCode.INVALID_CREDENTIALS]: "Invalid credentials",
    [AuthErrorCode.USER_NOT_FOUND]: "User not found",
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: "Email not verified",
    [AuthErrorCode.ACCOUNT_DISABLED]: "Account has been disabled",
    [AuthErrorCode.TOO_MANY_REQUESTS]: "Too many requests",
    [AuthErrorCode.INTERNAL_ERROR]: "Internal authentication error",
  };

  const defaultStatusCodes: Record<AuthErrorCode, number> = {
    [AuthErrorCode.INVALID_TOKEN]: 401,
    [AuthErrorCode.TOKEN_EXPIRED]: 401,
    [AuthErrorCode.UNAUTHORIZED]: 401,
    [AuthErrorCode.FORBIDDEN]: 403,
    [AuthErrorCode.INVALID_CREDENTIALS]: 401,
    [AuthErrorCode.USER_NOT_FOUND]: 404,
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: 403,
    [AuthErrorCode.ACCOUNT_DISABLED]: 403,
    [AuthErrorCode.TOO_MANY_REQUESTS]: 429,
    [AuthErrorCode.INTERNAL_ERROR]: 500,
  };

  return new AuthenticationError(
    code,
    message || defaultMessages[code],
    statusCode || defaultStatusCodes[code],
    details,
  );
}
