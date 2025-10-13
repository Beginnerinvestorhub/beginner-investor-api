"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePremium = exports.requireAdmin = exports.requireEmailVerified = exports.optionalAuth = exports.serviceAuth = exports.authorize = exports.authenticateLegacy = exports.authenticate = void 0;
exports.validateToken = validateToken;
exports.isFirebaseInitialized = isFirebaseInitialized;
exports.getFirebaseInfo = getFirebaseInfo;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
const auth_types_1 = require("./auth.types");
class FirebaseAdmin {
    constructor() {
        this.initialized = false;
        try {
            const firebaseConfig = (0, config_1.getFirebaseConfig)();
            if (!firebaseConfig.project_id || !firebaseConfig.client_email || !firebaseConfig.private_key) {
                throw new Error('Invalid Firebase configuration: missing required credentials');
            }
            this.app = (0, app_1.getApps)().length === 0
                ? (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)({
                        projectId: firebaseConfig.project_id,
                        clientEmail: firebaseConfig.client_email,
                        privateKey: firebaseConfig.private_key,
                    }),
                })
                : (0, app_1.getApp)();
            this.initialized = true;
            logger_1.logger.info('Firebase Admin SDK initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Firebase initialization error:', error);
            throw new Error('Failed to initialize Firebase Admin SDK');
        }
    }
    static getInstance() {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = new FirebaseAdmin();
        }
        return FirebaseAdmin.instance;
    }
    isInitialized() {
        return this.initialized;
    }
    getAuth() {
        if (!this.initialized) {
            throw new Error('Firebase Admin SDK not initialized');
        }
        return (0, auth_1.getAuth)(this.app);
    }
    async verifyToken(token) {
        try {
            if (!this.initialized) {
                throw new Error('Firebase Admin SDK not initialized');
            }
            // Try to verify the token
            const decodedToken = await this.getAuth().verifyIdToken(token, true); // Check if revoked
            return decodedToken;
        }
        catch (error) {
            logger_1.logger.error('Token verification failed:', error);
            throw new auth_types_1.AuthenticationError('Invalid or expired token', 'INVALID_TOKEN');
        }
    }
    async getUser(uid) {
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
        }
        catch (error) {
            return null;
        }
    }
}
// Initialize Firebase Admin
const firebaseAdmin = FirebaseAdmin.getInstance();
/**
 * Enhanced middleware to verify Firebase token with comprehensive options
 */
const authenticate = (options = {}) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                if (options.optional) {
                    return next();
                }
                return res.status(401).json({
                    error: 'Unauthorized: No token provided',
                    code: 'MISSING_TOKEN'
                });
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                if (options.optional) {
                    return next();
                }
                return res.status(401).json({
                    error: 'Unauthorized: Invalid token format',
                    code: 'INVALID_TOKEN_FORMAT'
                });
            }
            try {
                const decodedToken = await firebaseAdmin.verifyToken(token);
                // Check if email verification is required
                if (options.requireEmailVerified && !decodedToken.email_verified) {
                    return res.status(403).json({
                        error: 'Forbidden: Email verification required',
                        code: 'EMAIL_NOT_VERIFIED'
                    });
                }
                // Add user context to request
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    emailVerified: decodedToken.email_verified,
                    roles: decodedToken.roles,
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
                    req.firebaseUser = await firebaseAdmin.getUser(decodedToken.uid);
                }
                next();
            }
            catch (error) {
                if (error instanceof auth_types_1.AuthenticationError) {
                    logger_1.logger.error('Authentication error:', { error: error.message, code: error.code });
                    return res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code
                    });
                }
                logger_1.logger.error('Unexpected authentication error:', error);
                return res.status(401).json({
                    error: 'Unauthorized: Invalid token',
                    code: 'INVALID_TOKEN'
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Authentication middleware error:', error);
            next(error);
        }
    };
};
exports.authenticate = authenticate;
/**
 * Legacy authenticate function for backward compatibility
 */
const authenticateLegacy = async (req, res, next) => {
    return (0, exports.authenticate)()(req, res, next);
};
exports.authenticateLegacy = authenticateLegacy;
/**
 * Enhanced middleware to check user roles with better error handling
 */
const authorize = (roles = [], options = {}) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized: No user found',
                    code: 'USER_NOT_FOUND'
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
                hasRole = roles.every(role => userRoles.includes(role));
            }
            else {
                // User must have at least ONE of the specified roles
                hasRole = roles.some(role => userRoles.includes(role));
            }
            if (!hasRole) {
                logger_1.logger.warn('Authorization failed', {
                    userId: req.user.uid,
                    userRoles,
                    requiredRoles: roles,
                    requireAll: options.requireAll
                });
                return res.status(403).json({
                    error: 'Forbidden: Insufficient permissions',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: roles,
                    provided: userRoles
                });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Authorization middleware error:', error);
            next(error);
        }
    };
};
exports.authorize = authorize;
/**
 * Enhanced service-to-service authentication middleware
 */
const serviceAuth = (req, res, next) => {
    try {
        const serviceToken = req.headers['x-service-token'] || req.headers['authorization'];
        if (!serviceToken) {
            return res.status(401).json({
                error: 'Unauthorized: No service token provided',
                code: 'MISSING_SERVICE_TOKEN'
            });
        }
        // Support both header formats
        const token = typeof serviceToken === 'string' && serviceToken.startsWith('Bearer ')
            ? serviceToken.split(' ')[1]
            : serviceToken;
        if (token === process.env.INTERNAL_SERVICE_SECRET) {
            // Add service context to request
            req.user = {
                uid: 'service-account',
                roles: ['service'],
                customClaims: { service: true }
            };
            return next();
        }
        return res.status(403).json({
            error: 'Forbidden: Invalid service token',
            code: 'INVALID_SERVICE_TOKEN'
        });
    }
    catch (error) {
        logger_1.logger.error('Service authentication error:', error);
        next(error);
    }
};
exports.serviceAuth = serviceAuth;
/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
exports.optionalAuth = (0, exports.authenticate)({ optional: true });
/**
 * Email verification required authentication middleware
 */
exports.requireEmailVerified = (0, exports.authenticate)({ requireEmailVerified: true });
/**
 * Admin-only authentication middleware
 */
exports.requireAdmin = (0, exports.authenticate)({
    roles: ['admin'],
    requireEmailVerified: true
});
/**
 * Premium user authentication middleware
 */
exports.requirePremium = (0, exports.authenticate)({
    roles: ['premium', 'admin'],
    requireEmailVerified: true
});
/**
 * Token validation utility function
 */
async function validateToken(token) {
    try {
        const decodedToken = await firebaseAdmin.verifyToken(token);
        const firebaseUser = await firebaseAdmin.getUser(decodedToken.uid);
        if (!firebaseUser) {
            return {
                isValid: false,
                error: new auth_types_1.AuthenticationError('User not found', 'USER_NOT_FOUND')
            };
        }
        const user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            roles: decodedToken.roles,
            customClaims: decodedToken.custom_claims,
            iat: decodedToken.iat,
            exp: decodedToken.exp,
            aud: decodedToken.aud,
            iss: decodedToken.iss,
            sub: decodedToken.sub,
        };
        return {
            isValid: true,
            user
        };
    }
    catch (error) {
        if (error instanceof auth_types_1.AuthenticationError) {
            return {
                isValid: false,
                error
            };
        }
        return {
            isValid: false,
            error: new auth_types_1.AuthenticationError('Token validation failed', 'VALIDATION_FAILED')
        };
    }
}
/**
 * Check if Firebase Admin SDK is properly initialized
 */
function isFirebaseInitialized() {
    return firebaseAdmin.isInitialized();
}
/**
 * Get current Firebase Admin instance info
 */
function getFirebaseInfo() {
    return {
        initialized: firebaseAdmin.isInitialized(),
        // Note: In a real implementation, you might want to expose more info
        // but avoid exposing sensitive configuration
    };
}
// Export the Firebase Admin instance for backward compatibility
exports.default = firebaseAdmin;
