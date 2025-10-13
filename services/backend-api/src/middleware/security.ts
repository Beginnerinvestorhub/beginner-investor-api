import cors from "cors";
import { NextFunction, Request, RequestHandler, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env.schema";

// Security headers middleware
const securityHeaders: RequestHandler = (req, res, next) => {
  if (!env.SECURITY_HEADERS_ENABLED) return next();

  // Set security headers using helmet
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https: http:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
      reportOnly: env.SECURITY_CSP_REPORT_ONLY,
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
    frameguard: {
      action: "deny",
    },
  })(req, res, next);
};

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      env.CORS_ORIGIN === "*" ||
      env.CORS_ORIGIN.split(",").includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["Authorization", "X-CSRF-Token"],
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(env.RATE_LIMIT_MAX, 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
});

// Security middleware to prevent common vulnerabilities
export const securityMiddleware = [
  // Set secure headers
  securityHeaders,

  // Enable CORS
  cors(corsOptions),

  // Apply rate limiting to all API routes
  (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(env.API_PREFIX)) {
      return apiLimiter(req, res, next);
    }
    next();
  },

  // Prevent HTTP Parameter Pollution
  (req: Request, res: Response, next: NextFunction) => {
    // Clean request query, body, and params
    const clean = (obj: any) => {
      if (!obj) return obj;
      Object.keys(obj).forEach((key) => {
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
          obj[key] = obj[key][0]; // Take first value
        } else if (obj[key] !== null && typeof obj[key] === "object") {
          clean(obj[key]); // Recursively clean nested objects
        }
      });
      return obj;
    };

    req.query = clean({ ...req.query });
    req.body = clean({ ...req.body });
    req.params = clean({ ...req.params });

    next();
  },
];

// Error handler for security-related issues
export const securityErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Don't leak stack traces in production
  const errorResponse = {
    status: "error",
    message: "An error occurred",
    ...(env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  };

  // Handle specific security-related errors
  if (err.name === "UnauthorizedError") {
    return res
      .status(401)
      .json({ ...errorResponse, message: "Invalid or missing token" });
  }

  if (err.name === "RateLimitExceeded") {
    return res.status(429).json({
      ...errorResponse,
      message: "Too many requests, please try again later.",
    });
  }

  if (err.name === "CorsError") {
    return res.status(403).json({
      ...errorResponse,
      message: "Not allowed by CORS",
    });
  }

  // Default to 500 for unhandled errors
  res.status(500).json(errorResponse);
};
