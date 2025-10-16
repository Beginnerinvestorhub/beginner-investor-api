import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Validate secrets on startup
import { SecretValidator } from "../../../shared/utils/secret-generator";

// Validate secrets early in startup
const secretValidation = SecretValidator.validateEnvironmentSecrets();
if (!secretValidation.isValid) {
  console.error("🚨 SECRET VALIDATION FAILED:");
  secretValidation.missing.forEach(key => {
    console.error(`❌ Missing required secret: ${key}`);
  });
  secretValidation.weak.forEach(({ key, issues }) => {
    console.error(`⚠️  Weak secret ${key}:`, issues.join(', '));
  });

  if (process.env.NODE_ENV === 'production') {
    console.error("🔥 REFUSING TO START IN PRODUCTION WITH INVALID SECRETS");
    process.exit(1);
  }

  console.warn("⚠️  Continuing in development mode with weak/invalid secrets");
}

// Import middleware
import { trackAffiliate } from "./middleware/affiliate.middleware";
import {
  enrichUserContext,
  addUserContextHeaders,
  validateUserContext,
} from "./middleware/user-context.middleware";
import {
  formatAuthErrors,
  authErrorHandler,
} from "./middleware/auth-errors.middleware";
import {
  isFirebaseInitialized,
  checkFirebaseHealth,
} from "./config/firebase-admin";

// Import routes
import nudgeRoutes from "./routes/nudge.routes";
import paywallRoutes from "./routes/paywall.routes";
import affiliateRoutes from "./routes/affiliate.routes";
import marketdataRoutes from "./routes/marketdata.routes";

// Initialize Redis cache and rate limiting systems
// import { initializeSystems, cleanup } from "../../../shared/cache/init.js";

// Main initialization function
async function startServer() {
  try {
    // Initialize cache systems
    console.log("🚀 Initializing cache and rate limiting systems...");
    // await initializeSystems();
    console.log("⚠️  Cache systems temporarily disabled for debugging");

    console.log("✅ ENV Check:", {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      COOKIE_SECRET: !!process.env.COOKIE_SECRET,
      REDIS_URL: !!process.env.REDIS_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    });

    const app = express();

    // Rate limiting
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests, please try again later.",
    });

    // Middleware
    app.use(
      cors({
        origin:
          process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
        credentials: true,
      }),
    );

    app.use(helmet());
    app.use(compression());
    app.use(express.json({ limit: "10kb" }));
    app.use(morgan("combined"));

    // Authentication error formatting middleware
    app.use(formatAuthErrors);

    // Trust first proxy (important if behind a reverse proxy like Nginx)
    app.set("trust proxy", 1);

    // Track affiliate visits on all routes
    app.use(trackAffiliate);

    // User context middleware (only for authenticated routes)
    app.use("/api/v1", enrichUserContext);
    app.use("/api/v1", addUserContextHeaders);
    app.use("/api/v1", validateUserContext);

    // Health check endpoint
    app.get("/health", (_req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version,
        firebase: {
          initialized: isFirebaseInitialized(),
        },
      });
    });

    // Authentication health check endpoint
    app.get("/health/auth", async (_req, res) => {
      try {
        const firebaseHealthy = await checkFirebaseHealth();
        const firebaseInitialized = isFirebaseInitialized();

        res.json({
          status:
            firebaseHealthy && firebaseInitialized ? "healthy" : "unhealthy",
          timestamp: new Date().toISOString(),
          firebase: {
            initialized: firebaseInitialized,
            healthy: firebaseHealthy,
          },
        });
      } catch (error) {
        res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Authentication system check failed",
        });
      }
    });

    // Root endpoint
    app.get("/", (_req, res) => {
      res.json({
        message: "Backend API",
        version: process.env.npm_package_version,
        environment: process.env.NODE_ENV || "development",
        documentation: "/docs", // Link to API documentation if available
      });
    });

    // API Routes
    const apiRouter = express.Router();

    // Apply rate limiting to API routes
    apiRouter.use(apiLimiter);

    // Use routes
    apiRouter.use("/nudges", nudgeRoutes);
    apiRouter.use("/paywall", paywallRoutes);
    apiRouter.use("/affiliate", affiliateRoutes);
    apiRouter.use("/marketdata", marketdataRoutes);

    // Mount API routes
    app.use("/api/v1", apiRouter);

    // Authentication error handler (must be before general error handler)
    app.use(authErrorHandler);

    // Error handling middleware
    app.use(
      (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        console.error("Error:", err);

        const statusCode = err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(statusCode).json({
          status: "error",
          statusCode,
          message,
          ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
      },
    );

    // 404 handler
    app.use((_req, res) => {
      res.status(404).json({
        status: "error",
        statusCode: 404,
        message: "Not Found",
        path: _req.path,
      });
    });

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", async (err: Error) => {
      console.error("UNHANDLED REJECTION! Shutting down...");
      console.error(err.name, err.message);
      // await cleanup();
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", async (err: Error) => {
      console.error("UNCAUGHT EXCEPTION! Shutting down...");
      console.error(err.name, err.message);
      // await cleanup();
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM (for Docker)
    process.on("SIGTERM", async () => {
      console.log("SIGTERM RECEIVED. Shutting down gracefully");
      // await cleanup();
      server.close(() => {
        console.log("Process terminated!");
      });
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", async () => {
      console.log("\nSIGINT RECEIVED. Shutting down gracefully");
      // await cleanup();
      server.close(() => {
        console.log("Process terminated!");
        process.exit(0);
      });
    });

    return app;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default startServer;
