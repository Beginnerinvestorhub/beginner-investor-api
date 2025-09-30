import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { env } from '../config/env.schema';

/**
 * Security headers middleware configuration
 * Implements best practices for web application security
 */

type SecurityHeadersConfig = {
  enableHSTS?: boolean;
  enableCSP?: boolean;
  enableXSSFilter?: boolean;
  enableNoSniff?: boolean;
  enableFrameGuard?: boolean;
  enableHpkp?: boolean;
  enableIENoOpen?: boolean;
  enableReferrerPolicy?: boolean;
  enableDnsPrefetchControl?: boolean;
  permittedCrossDomainPolicies?: boolean;
  expectCt?: boolean;
};

/**
 * Creates a middleware function that sets various HTTP security headers
 */
export const securityHeaders = (config: SecurityHeadersConfig = {}) => {
  const {
    enableHSTS = true,
    enableCSP = true,
    enableXSSFilter = true,
    enableNoSniff = true,
    enableFrameGuard = true,
    enableHpkp = false, // Disabled by default as it can cause issues if misconfigured
    enableIENoOpen = true,
    enableReferrerPolicy = true,
    enableDnsPrefetchControl = true,
    permittedCrossDomainPolicies = true,
    expectCt = true,
  } = config;

  const middlewares = [];

  // Helmet middleware with all security headers
  middlewares.push(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: enableCSP
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'" // Only for development, should be removed in production
              ],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'", 'data:'],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'self'"],
              upgradeInsecureRequests: [],
            },
            reportOnly: env.SECURITY_CSP_REPORT_ONLY,
          }
        : false,

      // HTTP Strict Transport Security
      hsts: enableHSTS
        ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
          }
        : false,

      // XSS Filter
      xssFilter: enableXSSFilter,

      // MIME type sniffing protection
      noSniff: enableNoSniff,

      // Frame options
      frameguard: enableFrameGuard
        ? {
            action: 'deny',
          }
        : false,

      // HPKP (HTTP Public Key Pinning) - Disabled by default
      hpkp: enableHpkp
        ? {
            maxAge: 5184000, // 60 days in seconds
            sha256s: [], // Add your public key hashes here
            includeSubDomains: true,
          }
        : false,

      // IE security
      ieNoOpen: enableIENoOpen,

      // Referrer Policy
      referrerPolicy: enableReferrerPolicy
        ? { policy: 'same-origin' }
        : false,

      // DNS Prefetch Control
      dnsPrefetchControl: enableDnsPrefetchControl
        ? {
            allow: false,
          }
        : false,

      // Permitted Cross-Domain Policies
      permittedCrossDomainPolicies: permittedCrossDomainPolicies
        ? {
            permittedPolicies: 'none',
          }
        : false,

      // Expect-CT header
      expectCt: expectCt
        ? {
            maxAge: 86400, // 1 day
            enforce: true,
            reportUri: '/report-ct-violation',
          }
        : false,
    })
  );

  // Additional security headers not covered by helmet
  middlewares.push((_req: Request, res: Response, next: NextFunction) => {
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options (redundant with frameguard but added for extra protection)
    res.setHeader('X-Frame-Options', 'DENY');

    // X-Download-Options
    res.setHeader('X-Download-Options', 'noopen');

    // X-Permitted-Cross-Domain-Policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // X-DNS-Prefetch-Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // X-Download-Options
    res.setHeader('X-Download-Options', 'noopen');

    // X-XSS-Protection (legacy, but still useful for older browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'fullscreen=self',
        'sync-xhr=self',
      ].join(', ')
    );

    // Cross-Origin Opener Policy
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // Cross-Origin-Resource-Policy
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    // Cross-Origin-Embedder-Policy
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    // Strict-Transport-Security (HSTS) - Redundant with helmet but added for clarity
    if (enableHSTS) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    next();
  });

  return middlewares;
};

/**
 * Middleware to handle security headers for API responses
 */
export const apiSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip security headers for API documentation in development
  if (env.NODE_ENV === 'development' && req.path.startsWith('/api-docs')) {
    return next();
  }

  // Apply security headers
  securityHeaders({
    enableCSP: !req.path.startsWith('/api/'), // Disable CSP for API routes
    enableHSTS: env.NODE_ENV === 'production',
  })[0](req, res, next);
};

/**
 * Middleware to handle security headers for static assets
 */
export const staticAssetsSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only apply to static assets
  if (!req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Cache static assets for 1 year
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  
  // Apply security headers
  securityHeaders({
    enableCSP: false, // CSP is handled at the application level
    enableHSTS: env.NODE_ENV === 'production',
  })[0](req, res, next);
};

// Export default security headers configuration
export default securityHeaders;
