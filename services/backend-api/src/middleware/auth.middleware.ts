import { authenticate } from '../../../shared/auth/firebase';

/**
 * Middleware to require authentication for routes
 */
export const requireAuth = authenticate;
