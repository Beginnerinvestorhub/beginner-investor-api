import { DecodedIdToken } from 'firebase-admin/auth';
export interface AuthenticatedUser {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    roles?: string[];
    customClaims?: {
        [key: string]: any;
    };
    iat?: number;
    exp?: number;
    aud?: string;
    iss?: string;
    sub?: string;
}
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
    customClaims?: {
        [key: string]: any;
    };
}
export interface AuthMiddlewareOptions {
    optional?: boolean;
    requireEmailVerified?: boolean;
    roles?: string[];
}
export declare class AuthenticationError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code?: string, statusCode?: number);
}
export declare class AuthorizationError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code?: string, statusCode?: number);
}
export interface AuthMiddlewareResult {
    success: boolean;
    user?: AuthenticatedUser;
    error?: AuthenticationError | AuthorizationError;
    code?: string;
}
export interface TokenValidationResult {
    isValid: boolean;
    user?: AuthenticatedUser;
    error?: AuthenticationError | AuthorizationError;
    decodedToken?: DecodedIdToken;
}
export interface ServiceAuthContext {
    serviceName: string;
    serviceId: string;
    permissions: string[];
    expiresAt?: number;
}
export interface ServiceTokenPayload {
    serviceName: string;
    serviceId: string;
    permissions: string[];
    iat: number;
    exp: number;
}
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
export interface RateLimitConfig {
    windowMs: number;
    maxAttempts: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: any) => string;
    handler?: (req: any, res: any, next: any) => void;
}
export interface MFAConfig {
    enabled: boolean;
    requiredForRoles?: string[];
    allowedMethods?: ('sms' | 'email' | 'totp' | 'push')[];
    issuer?: string;
    digits?: number;
    window?: number;
}
export interface PasswordPolicy {
    minLength: number;
    maxLength?: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse?: number;
    maxAge?: number;
}
export interface AccountLockoutConfig {
    enabled: boolean;
    maxAttempts: number;
    lockoutDuration: number;
    resetAfter?: number;
}
export interface SecurityAuditConfig {
    enabled: boolean;
    logFailedAttempts: boolean;
    logSuccessfulLogins: boolean;
    logPasswordChanges: boolean;
    logRoleChanges: boolean;
    retentionDays: number;
}
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
//# sourceMappingURL=auth.types.d.ts.map