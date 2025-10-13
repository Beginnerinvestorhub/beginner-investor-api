import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Authenticated user information extracted from Firebase token
 */
export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  roles?: string[];
  customClaims?: { [key: string]: any };
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
  sub?: string;
}

/**
 * Firebase user record from Firebase Auth
 */
export interface FirebaseUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  disabled?: boolean;
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
  };
  customClaims?: { [key: string]: any };
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  optional?: boolean;
  requireEmailVerified?: boolean;
  roles?: string[];
}

/**
 * Authentication error class for consistent error handling
 */
export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'AUTHENTICATION_ERROR', statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error class for consistent error handling
 */
export class AuthorizationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'AUTHORIZATION_ERROR', statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Result type for authentication middleware
 */
export interface AuthMiddlewareResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: AuthenticationError | AuthorizationError;
  code?: string;
}

/**
 * Result type for token validation
 */
export interface TokenValidationResult {
  isValid: boolean;
  user?: AuthenticatedUser;
  error?: AuthenticationError | AuthorizationError;
  decodedToken?: DecodedIdToken;
}

/**
 * Service authentication context
 */
export interface ServiceAuthContext {
  serviceName: string;
  serviceId: string;
  permissions: string[];
  expiresAt?: number;
}

/**
 * JWT payload structure for service tokens
 */
export interface ServiceTokenPayload {
  serviceName: string;
  serviceId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Authentication configuration options
 */
export interface AuthConfig {
  firebase?: {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  };
  jwt?: {
    secret?: string;
    expiresIn?: string;
    issuer?: string;
    audience?: string;
  };
  session?: {
    secret?: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
  };
}

/**
 * User session data stored in cache/database
 */
export interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    location?: string;
  };
  lastActivity?: Date;
}

/**
 * Authentication event for logging and monitoring
 */
export interface AuthEvent {
  eventId: string;
  userId?: string;
  eventType: 'login' | 'logout' | 'token_refresh' | 'password_reset' | 'account_locked' | 'suspicious_activity';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
  riskScore?: number;
}

/**
 * Rate limiting configuration for authentication endpoints
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any, next: any) => void;
}

/**
 * Multi-factor authentication configuration
 */
export interface MFAConfig {
  enabled: boolean;
  requiredForRoles?: string[];
  allowedMethods?: ('sms' | 'email' | 'totp' | 'push')[];
  issuer?: string;
  digits?: number;
  window?: number;
}

/**
 * Password policy configuration
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength?: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse?: number; // Number of previous passwords to prevent reuse
  maxAge?: number; // Days before password expires
}

/**
 * Account lockout configuration
 */
export interface AccountLockoutConfig {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number; // Minutes
  resetAfter?: number; // Minutes of inactivity before resetting attempts
}

/**
 * Security audit configuration
 */
export interface SecurityAuditConfig {
  enabled: boolean;
  logFailedAttempts: boolean;
  logSuccessfulLogins: boolean;
  logPasswordChanges: boolean;
  logRoleChanges: boolean;
  retentionDays: number;
}

/**
 * OAuth provider configuration
 */
export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationURL: string;
  tokenURL: string;
  userInfoURL: string;
  scope?: string[];
  enabled: boolean;
}

/**
 * SAML configuration for enterprise SSO
 */
export interface SAMLConfig {
  enabled: boolean;
  entryPoint: string;
  issuer: string;
  cert?: string;
  audience?: string;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
  acceptedClockSkewMs?: number;
}

/**
 * Authentication metrics for monitoring
 */
export interface AuthMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  failedLoginAttempts: number;
  successfulLoginAttempts: number;
  lockedAccounts: number;
  passwordResets: number;
  mfaEnabledUsers: number;
  averageSessionDuration: number;
  topLoginLocations: Array<{
    country: string;
    count: number;
  }>;
}

/**
 * Authentication analytics data
 */
export interface AuthAnalytics {
  dailyActiveUsers: Array<{
    date: string;
    count: number;
  }>;
  loginSuccessRate: number;
  registrationRate: number;
  churnRate: number;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    percentage: number;
  }>;
}
