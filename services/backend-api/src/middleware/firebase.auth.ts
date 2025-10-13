import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No authorization token provided');
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken) {
      logger.warn('Invalid authentication token');
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

export const requireAuth = authenticate;

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

export const requireEmailVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.email_verified) {
    return res.status(403).json({ error: 'Email verification required' });
  }
  next();
};

export const requireAdmin = [
  authenticate,
  authorize(['admin'])
];

export const requirePremium = [
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.premium) {
      return res.status(403).json({ error: 'Premium subscription required' });
    }
    next();
  }
];

export const serviceAuth = (req: Request, res: Response, next: NextFunction) => {
  const serviceKey = req.headers['x-service-key'];
  if (serviceKey !== process.env.SERVICE_KEY) {
    return res.status(401).json({ error: 'Invalid service key' });
  }
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
    } catch (error) {
      logger.warn('Optional auth - invalid token:', error);
      // Continue without setting req.user
    }
  }
  
  next();
};
