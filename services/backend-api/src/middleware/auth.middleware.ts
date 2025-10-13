// Import the improved authentication middleware from shared library
export {
  authenticate,
  authorize,
  optionalAuth,
  requireEmailVerified,
  requireAdmin,
  requirePremium,
  serviceAuth,
} from "/../shared/auth/firebase.js";

// Re-export for backward compatibility and convenience
export { authenticate as requireAuth } from "../../../shared/auth/firebase.js";
