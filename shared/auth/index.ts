// Re-export all Firebase authentication functions and types
export {
  authenticate,
  authorize,
  optionalAuth,
  requireEmailVerified,
  requireAdmin,
  requirePremium,
  serviceAuth,
  authenticateLegacy,
  validateToken,
  isFirebaseInitialized,
  getFirebaseInfo,
} from './firebase';

export type {
  AuthenticatedUser,
  FirebaseUser,
  AuthMiddlewareOptions,
  TokenValidationResult,
  AuthenticationError,
  AuthorizationError,
  AuthMiddlewareResult,
} from './auth.types';

// Export the Firebase Admin instance for backward compatibility
export { default as firebaseAdmin } from './firebase';
