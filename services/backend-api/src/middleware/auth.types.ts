export interface AuthenticatedUser {
  uid: string;
  email?: string | null;
  emailVerified?: boolean;
  roles?: string[];
  customClaims?: Record<string, any>;
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
  sub?: string;
}

export interface FirebaseUser {
  uid: string;
  email?: string | null;
  emailVerified: boolean;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  disabled: boolean;
  metadata: {
    lastSignInTime?: string | null;
    creationTime?: string | null;
  };
  customClaims?: Record<string, any>;
}

export interface AuthMiddlewareOptions {
  requireEmailVerified?: boolean;
  roles?: string[];
  requireAll?: boolean;
  optional?: boolean;
}

export interface TokenValidationResult {
  isValid: boolean;
  user?: AuthenticatedUser;
  error?: Error;
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR',
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTHORIZATION_ERROR',
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type AuthMiddlewareResult = void | Response | Promise<void | Response>;
