// services/backend-api/src/types/auth.types.ts

import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

// Firebase Admin SDK types
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

// Extended Express Request interface with user context
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      firebaseUser?: FirebaseUser;
      token?: DecodedIdToken;
    }
  }
}

// Authenticated user context (what we add to request after verification)
export interface AuthenticatedUser {
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
  roles?: string[];
  customClaims?: { [key: string]: any };
  iat?: number; // issued at (timestamp)
  exp?: number; // expiration time (timestamp)
  aud?: string; // audience
  iss?: string; // issuer
  sub?: string; // subject
}

// Authentication middleware options
export interface AuthMiddlewareOptions {
  optional?: boolean; // If true, auth is optional and user might be undefined
  roles?: string[]; // Required roles for access
  requireEmailVerified?: boolean; // If true, requires email to be verified
}

// Role-based access control types
export type UserRole = "admin" | "user" | "premium" | "moderator";

// Authentication error types
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 401,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Token validation result
export interface TokenValidationResult {
  isValid: boolean;
  user?: AuthenticatedUser;
  error?: AuthenticationError;
}

// Authentication configuration
export interface AuthConfig {
  jwtSecret?: string;
  tokenExpiry?: number;
  refreshTokenExpiry?: number;
  algorithm?: "RS256" | "HS256";
}

// Service account credentials interface
export interface ServiceAccountCredentials {
  type: "service_account";
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Firebase configuration interface
export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL?: string;
}

// Authentication response types
export interface AuthResponse {
  success: boolean;
  user?: AuthenticatedUser;
  error?: {
    code: string;
    message: string;
  };
}

// User registration data
export interface UserRegistrationData {
  email: string;
  password: string;
  displayName?: string;
  emailVerified?: boolean;
}

// User profile update data
export interface UserProfileUpdate {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  customClaims?: { [key: string]: any };
}

// Rate limiting for auth endpoints
export interface AuthRateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDuration?: number;
  skipSuccessfulRequests?: boolean;
}

// Auth middleware result
export interface AuthMiddlewareResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  error?: AuthenticationError | AuthorizationError;
}

// Firebase authentication state
export interface FirebaseAuthState {
  initialized: boolean;
  projectId?: string;
  lastHealthCheck?: Date;
  isHealthy?: boolean;
}

// Token refresh data
export interface TokenRefreshData {
  refreshToken: string;
  accessToken?: string;
}

// Multi-factor authentication types
export interface MFAOptions {
  enabled: boolean;
  factors?: MFAAvailableFactor[];
}

export interface MFAAvailableFactor {
  uid: string;
  factorId: string;
  displayName: string;
  enrollmentTime?: string;
}

// Session management types
export interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    fingerprint?: string;
  };
}

// Audit log entry for authentication events
export interface AuthAuditLog {
  id: string;
  userId?: string;
  event:
    | "login"
    | "logout"
    | "token_refresh"
    | "password_reset"
    | "mfa_enabled"
    | "mfa_disabled";
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: { [key: string]: any };
}
