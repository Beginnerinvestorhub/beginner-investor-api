import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert, App, getApp, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { logger } from '../utils/logger';
import { redisManager } from '../redis';
import { getFirebaseConfig } from '../config';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private app: App;

  private constructor() {
    const firebaseConfig = getFirebaseConfig();

    try {
      this.app = getApps().length === 0
        ? initializeApp({
            credential: cert({
              projectId: firebaseConfig.project_id,
              clientEmail: firebaseConfig.client_email,
              privateKey: firebaseConfig.private_key,
            }),
          })
        : getApp();
    } catch (error) {
      logger.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin');
    }
  }

  public static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  public getAuth() {
    return getAuth(this.app);
  }

  public async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      // Try to verify the token
      const decodedToken = await this.getAuth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }
}

// Initialize Firebase Admin
const firebaseAdmin = FirebaseAdmin.getInstance();

/**
 * Middleware to verify Firebase token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await firebaseAdmin.verifyToken(token);

      // Add user to request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...decodedToken
      };

      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check user roles
 */
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    // If no roles are specified, just check if user is authenticated
    if (roles.length === 0) {
      return next();
    }

    // Check if user has any of the required roles
    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Service-to-service authentication middleware
 */
export const serviceAuth = (req: Request, res: Response, next: NextFunction) => {
  const serviceToken = req.headers['x-service-token'];

  if (serviceToken === process.env.INTERNAL_SERVICE_SECRET) {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden: Invalid service token'
  });
};

export default firebaseAdmin;
