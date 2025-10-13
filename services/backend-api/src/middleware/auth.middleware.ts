// Import from shared auth implementation using @shared alias
export {
  authenticate,
  authorize,
  optionalAuth,
  requireEmailVerified,
  requireAdmin,
  requirePremium,
  serviceAuth,
  authenticate as requireAuth
} from '@shared/auth/firebase';

// Re-export types for backward compatibility
export type {
  AuthenticatedUser,
  FirebaseUser,
  AuthMiddlewareOptions,
  TokenValidationResult,
  AuthenticationError,
  AuthorizationError
} from '@shared/auth/firebase';
