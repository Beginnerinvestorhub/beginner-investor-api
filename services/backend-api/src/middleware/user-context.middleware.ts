// services/backend-api/src/middleware/user-context.middleware.ts

import type { Request, Response, NextFunction } from "express";
import { AuthenticatedUser, FirebaseUser } from "../types/auth.types";
import { getFirebaseInfo } from "../../../shared/auth/firebase.js";

/**
 * Middleware to enrich user context with additional Firebase user data
 */
export const enrichUserContext = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Only enrich if user is already authenticated
    if (!req.user || !req.user.uid) {
      return next();
    }

    // Import firebase admin dynamically to avoid circular dependencies
    const { getFirebaseInfo } = await import("../../../shared/auth/firebase");

    if (!getFirebaseInfo().initialized) {
      console.warn(
        "Firebase not initialized, skipping user context enrichment",
      );
      return next();
    }

    // Get additional user data from Firebase
    try {
      const firebaseAdmin = (await import("../../../shared/auth/firebase"))
        .default;
      const firebaseUser = await firebaseAdmin.getUser(req.user.uid);

      if (firebaseUser && req.user) {
        // Merge Firebase user data with authenticated user data
        req.firebaseUser = firebaseUser;

        // Update user object with additional context
        req.user = {
          ...req.user,
          displayName:
            firebaseUser.displayName || req.user.email?.split("@")[0],
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          disabled: firebaseUser.disabled,
          metadata: firebaseUser.metadata,
        };
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to enrich user context:", error);
    }

    next();
  } catch (error) {
    console.error("User context middleware error:", error);
    next(error);
  }
};

/**
 * Middleware to add user context to response headers for debugging
 * Only in development mode
 */
export const addUserContextHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "development" && req.user) {
    res.setHeader("X-User-ID", req.user.uid);
    res.setHeader("X-User-Email", req.user.email || "");
    res.setHeader("X-User-Roles", (req.user.roles || []).join(","));
  }

  next();
};

/**
 * Middleware to validate user context consistency
 */
export const validateUserContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check if user context is consistent
    if (req.user && req.firebaseUser) {
      if (req.user.uid !== req.firebaseUser.uid) {
        console.error("User context mismatch:", {
          userUid: req.user.uid,
          firebaseUid: req.firebaseUser.uid,
        });

        return res.status(500).json({
          error: "User context validation failed",
          code: "CONTEXT_MISMATCH",
        });
      }
    }

    next();
  } catch (error) {
    console.error("User context validation error:", error);
    next(error);
  }
};

/**
 * Middleware to log user activity for audit purposes
 */
export const logUserActivity = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Store original send method to log after response
  const originalSend = res.send;

  res.send = function (data) {
    // Log user activity asynchronously
    if (req.user && req.user.uid) {
      setImmediate(() => {
        console.log("User Activity:", {
          userId: req.user!.uid,
          email: req.user!.email,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        });
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware to check if user account is active and not disabled
 */
export const requireActiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.firebaseUser) {
      return next();
    }

    if (req.firebaseUser.disabled) {
      return res.status(403).json({
        error: "Account disabled",
        code: "ACCOUNT_DISABLED",
      });
    }

    next();
  } catch (error) {
    console.error("Active user check error:", error);
    next(error);
  }
};
