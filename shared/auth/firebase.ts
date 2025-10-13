import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert, App, getApp, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { logger } from '../utils/logger';
import { getFirebaseConfig } from '../config';
import {
  AuthenticatedUser,
  AuthMiddlewareOptions,
  AuthenticationError,
  FirebaseUser,
  TokenValidationResult,
} from './auth.types';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    firebaseUser?: FirebaseUser;
    token?: DecodedIdToken;
  }
}

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private app: App;
  private initialized: boolean = false;

  private constructor() {
    try {
      const firebaseConfig = getFirebaseConfig();

      if (
        !firebaseConfig.project_id ||
        !firebaseConfig.client_email ||
        !firebaseConfig.private_key
      ) {
        throw new Error('Invalid Firebase configuration: missing required credentials');
      }

      this.app =
        getApps().length === 0
          ? initializeApp({
              credential: cert({
                projectId: firebaseConfig.project_id,
                clientEmail: firebaseConfig.client_email,
                privateKey: firebaseConfig.private_key,
              }),
            })
          : getApp();

      this.initialized = true;
      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin SDK');
    }
  }

  public static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getAuth(): ReturnType<typeof getAuth> {
    if (!this.initialized) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return getAuth(this.app);
  }

  public async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      // Try to verify the token
      const decodedToken = await this.getAuth().verifyIdToken(token, true); // Check if revoked
      return decodedToken;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new AuthenticationError('Invalid or expired token', 'INVALID_TOKEN');
    }
  }

  public async getUser(uid: string): Promise<FirebaseUser | null> {
    try {
      if (!this.initialized) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const userRecord = await this.getAuth().getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        phoneNumber: userRecord.phoneNumber,
        disabled: userRecord.disabled,
        metadata: {
          lastSignInTime: userRecord.metadata.lastSignInTime,
          creationTime: userRecord.metadata.creationTime,
        },
        customClaims: userRecord.customClaims,
      };
    } catch (error) {
      return null;
    }
  }
}

// Initialize Firebase Admin
const firebaseAdmin = FirebaseAdmin.getInstance();

/**
 * Enhanced middleware to verify Firebase token with comprehensive options
 */
export const authenticate = (
  options: AuthMiddlewareOptions = {}
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (options.optional) {
          return next();
        }
        return res.status(401).json({
          error: 'Unauthorized: No token provided',
          code: 'MISSING_TOKEN',
        });
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        if (options.optional) {
          return next();
        }
        return res.status(401).json({
          error: 'Unauthorized: Invalid token format',
          code: 'INVALID_TOKEN_FORMAT',
        });
      }

      try {
        const decodedToken = await firebaseAdmin.verifyToken(token);

        // Check if email verification is required
        if (options.requireEmailVerified && !decodedToken.email_verified) {
          return res.status(403).json({
            error: 'Forbidden: Email verification required',
            code: 'EMAIL_NOT_VERIFIED',
          });
        }

        // Add user context to request
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          roles: decodedToken.roles as string[] | undefined,
          customClaims: decodedToken.custom_claims,
          iat: decodedToken.iat,
          exp: decodedToken.exp,
          aud: decodedToken.aud,
          iss: decodedToken.iss,
          sub: decodedToken.sub,
        };

        req.token = decodedToken;

        // Fetch additional user data if needed
        if (decodedToken.uid) {
          req.firebaseUser = (await firebaseAdmin.getUser(decodedToken.uid)) || undefined;
        }

        next();
      } catch (error) {
        if (error instanceof AuthenticationError) {
          logger.error('Authentication error:', { error: error.message, code: error.code });
          return res.status(error.statusCode).json({
            error: error.message,
            code: error.code,
          });
        }

        logger.error('Unexpected authentication error:', error);
        return res.status(401).json({
          error: 'Unauthorized: Invalid token',
          code: 'INVALID_TOKEN',
        });
      }
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      next(error);
    }
  };
};

/**
 * Legacy authenticate function for backward compatibility
 */
export const authenticateLegacy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return authenticate()(req, res, next);
};

/**
 * Enhanced middleware to check user roles with better error handling
 */
export const authorize = (
  roles: string[] = [],
  options: { requireAll?: boolean } = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized: No user found',
          code: 'USER_NOT_FOUND',
        });
      }

      // If no roles are specified, just check if user is authenticated
      if (roles.length === 0) {
        return next();
      }

      const userRoles = req.user.roles || [];
      let hasRole = false;

      if (options.requireAll) {
        // User must have ALL specified roles
        hasRole = roles.every((role) => userRoles.includes(role));
      } else {
        // User must have at least ONE of the specified roles
        hasRole = roles.some((role) => userRoles.includes(role));
      }

      if (!hasRole) {
        logger.warn('Authorization failed', {
          userId: req.user.uid,
          userRoles,
          requiredRoles: roles,
          requireAll: options.requireAll,
        });

        return res.status(403).json({
          error: 'Forbidden: Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: roles,
          provided: userRoles,
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      next(error);
    }
  };
};

/**
 * Enhanced service-to-service authentication middleware
 */
export const serviceAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serviceToken = req.headers['x-service-token'] || req.headers['authorization'];

    if (!serviceToken) {
      return res.status(401).json({
        error: 'Unauthorized: No service token provided',
        code: 'MISSING_SERVICE_TOKEN',
      });
    }

    // Support both header formats
    const token =
      typeof serviceToken === 'string' && serviceToken.startsWith('Bearer ')
        ? serviceToken.split(' ')[1]
        : serviceToken;

    if (token === process.env.INTERNAL_SERVICE_SECRET) {
      // Add service context to request
      req.user = {
        uid: 'service-account',
        roles: ['service'],
        customClaims: { service: true },
      };
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden: Invalid service token',
      code: 'INVALID_SERVICE_TOKEN',
    });
  } catch (error) {
    logger.error('Service authentication error:', error);
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = authenticate({ optional: true });

/**
 * Email verification required authentication middleware
 */
export const requireEmailVerified = authenticate({ requireEmailVerified: true });

/**
 * Admin-only authentication middleware
 */
export const requireAdmin = authenticate({
  roles: ['admin'],
  requireEmailVerified: true,
});

/**
 * Premium user authentication middleware
 */
export const requirePremium = authenticate({
  roles: ['premium', 'admin'],
  requireEmailVerified: true,
});

/**
 * Token validation utility function
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
  try {
    const decodedToken = await firebaseAdmin.verifyToken(token);
    const firebaseUser = await firebaseAdmin.getUser(decodedToken.uid);

    if (!firebaseUser) {
      return {
        isValid: false,
        error: new AuthenticationError('User not found', 'USER_NOT_FOUND'),
      };
    }

    const user: AuthenticatedUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      roles: decodedToken.roles as string[] | undefined,
      customClaims: decodedToken.custom_claims,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
      aud: decodedToken.aud,
      iss: decodedToken.iss,
      sub: decodedToken.sub,
    };

    return {
      isValid: true,
      user,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        isValid: false,
        error,
      };
    }

    return {
      isValid: false,
      error: new AuthenticationError('Token validation failed', 'VALIDATION_FAILED'),
    };
  }
}

/**
 * Check if Firebase Admin SDK is properly initialized
 */
export function isFirebaseInitialized(): boolean {
  return firebaseAdmin.isInitialized();
}

/**
 * Get current Firebase Admin instance info
 */
export function getFirebaseInfo() {
  return {
    initialized: firebaseAdmin.isInitialized(),
    // Note: In a real implementation, you might want to expose more info
    // but avoid exposing sensitive configuration
  };
}

// Export the Firebase Admin instance for backward compatibility
export default firebaseAdmin;
