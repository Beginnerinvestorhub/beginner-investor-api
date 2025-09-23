// src/utils/secure-cookies.ts
import { Request, Response } from 'express';
import { env } from '../config/env.schema';

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge?: number;
  domain?: string;
  path?: string;
  expires?: Date;
  partitioned?: boolean;
};

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  partitioned: true,
};

export class SecureCookies {
  /**
   * Set a secure cookie
   */
  static setCookie(
    res: Response,
    name: string,
    value: string,
    options: Partial<CookieOptions> = {}
  ): void {
    const cookieOptions: CookieOptions = {
      ...defaultCookieOptions,
      ...options,
    };

    // Set domain if specified in environment
    if (env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    res.cookie(name, value, cookieOptions);
  }

  /**
   * Clear a cookie
   */
  static clearCookie(res: Response, name: string): void {
    const options: CookieOptions = {
      ...defaultCookieOptions,
      maxAge: 0,
      expires: new Date(0),
    };

    if (env.COOKIE_DOMAIN) {
      options.domain = env.COOKIE_DOMAIN;
    }

    res.clearCookie(name, options);
  }

  /**
   * Set authentication cookies (access and refresh tokens)
   */
  static setAuthCookies(
    res: Response,
    {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
    }: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresIn: number; // in seconds
    }
  ): void {
    // Set access token cookie (short-lived)
    this.setCookie(res, 'access_token', accessToken, {
      maxAge: accessTokenExpiresIn * 1000, // convert to milliseconds
      sameSite: 'strict',
    });

    // Set refresh token cookie (long-lived, httpOnly)
    this.setCookie(res, 'refresh_token', refreshToken, {
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
      sameSite: 'strict',
    });
  }

  /**
   * Clear authentication cookies
   */
  static clearAuthCookies(res: Response): void {
    this.clearCookie(res, 'access_token');
    this.clearCookie(res, 'refresh_token');
  }

  /**
   * Generate CSRF token and set it in a cookie
   */
  static setCsrfToken(res: Response, token: string): void {
    this.setCookie(res, 'XSRF-TOKEN', token, {
      httpOnly: false, // Needs to be accessible from JavaScript
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  /**
   * Clear CSRF token cookie
   */
  static clearCsrfToken(res: Response): void {
    this.clearCookie(res, 'XSRF-TOKEN');
  }

  /**
   * Get CSRF token from request
   */
  static getCsrfToken(req: Request): string | undefined {
    // Check header first (for API requests)
    const headerToken = req.headers['x-csrf-token'] || 
                       req.headers['xsrf-token'] || 
                       req.headers['x-xsrf-token'];
    
    if (Array.isArray(headerToken)) {
      return headerToken[0];
    } else if (headerToken) {
      return headerToken;
    }

    // Then check body (for form submissions)
    if (req.body && req.body._csrf) {
      return req.body._csrf;
    }

    // Finally check query string
    return req.query._csrf as string | undefined;
  }

  /**
   * Verify CSRF token
   */
  static verifyCsrfToken(req: Request): boolean {
    const csrfToken = this.getCsrfToken(req);
    const cookieToken = req.cookies['XSRF-TOKEN'];
    
    if (!csrfToken || !cookieToken) {
      return false;
    }

    return csrfToken === cookieToken;
  }

  /**
   * Middleware to enforce CSRF protection
   */
  static csrfProtection(req: Request, res: Response, next: Function): void {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(req.method)) {
      return next();
    }

    if (!this.verifyCsrfToken(req)) {
      res.status(403).json({ 
        error: 'Invalid CSRF token',
        code: 'INVALID_CSRF_TOKEN'
      });
      return;
    }

    next();
  }
}

// Export a singleton instance
export const secureCookies = new SecureCookies();

// Middleware to automatically add CSRF token to responses
export const csrfMiddleware = (req: Request, res: Response, next: Function) => {
  // Skip for API routes that don't need CSRF
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Generate and set CSRF token if not already set
  if (!req.cookies['XSRF-TOKEN']) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    SecureCookies.setCsrfToken(res, token);
  }

  next();
};