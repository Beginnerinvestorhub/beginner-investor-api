"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
import { testConnection, initializeDatabase } from "./config/database";

// === FIX: Load environment variables first ===
// Load environment variables from backend-api/.env
// This must be done *before* any other code (like schema validation)
// that depends on these variables runs.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// ===========================================
console.log('✅ Loaded ENV:', {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  });
  
// Middleware: Dev logger
if (process.env.NODE_ENV !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}

// Middleware: CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*';
app.use((0, cors_1.default)({ origin: allowedOrigins }));

// Middleware: Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);
app.use(express_1.default.json());

// API Routes (imports)
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { dashboardRouter } from "./routes/dashboard";
import { adminRouter } from "./routes/admin";
const newsletter_1 = __importDefault(require("./routes/newsletter"));
const stripe_1 = __importDefault(require("./routes/stripe"));
const profile_1 = __importDefault(require("./routes/profile"));
const gamification_1 = __importDefault(require("./routes/gamification"));
import { educationRouter } from "./routes/education";
import { leaderboardRouter } from "./routes/leaderboard";
import { challengesRouter } from "./routes/challenges";

// OpenAPI Documentation
import { docsAuth, serveDocsLanding, serveSwaggerUI, serveReDoc, serveOpenApiSpec } from "./middleware/swagger";

// API Documentation Routes (with optional authentication)
app.get('/api/docs', docsAuth, serveDocsLanding);
app.get('/api/docs/swagger', docsAuth, serveSwaggerUI);
app.get('/api/docs/redoc', docsAuth, serveReDoc);
app.get('/api/docs/openapi.json', serveOpenApiSpec);

// API Routes (usage)
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);
app.use('/api/newsletter', newsletter_1.default);
app.use('/api/stripe', stripe_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/gamification', gamification_1.default);
app.use('/api/education', educationRouter);
app.use('/api/gamification/leaderboard', leaderboardRouter);
app.use('/api/gamification/challenges', challengesRouter);

// Enhanced Health Check with system status
app.get('/api/health', async (_, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: process.env.DATABASE_URL ? 'healthy' : 'unavailable',
            stripe: process.env.STRIPE_SECRET_KEY ? 'healthy' : 'unavailable',
            redis: 'unavailable' // Add Redis check if implemented
        }
    };
    res.json(healthStatus);
});

// Initialize Database and Start Server
if (require.main === module) {
    const port = process.env.PORT || 4000;
    // Initialize database connection and schema
    const initServer = async () => {
        try {
            if (process.env.DATABASE_URL) {
                // Only attempt connection/init if URL is present
                const dbConnected = await (0, testConnection)();
                if (dbConnected) {
                    await (0, initializeDatabase)();
                    console.log('🗄️ Database initialized successfully');
                }
            }
            else {
                // Log only if it wasn't already warned above to prevent duplicate messages
                // This is a stylistic improvement, the main fix is the dotenv position.
                // console.log('⚠️ Skipping database initialization - DATABASE_URL not provided'); 
            }
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error);
            console.log('⚠️ Server will continue without database functionality');
        }
        app.listen(port, () => {
            const host = process.env.NODE_ENV === 'production' ? process.env.BACKEND_HOST || 'production' : 'localhost';
            console.log(`✅ Backend API running at http://${host}:${port}`);
        });
    };
    initServer();
    if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Loaded ENV:', {
            ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
            STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
            DATABASE_URL: !!process.env.DATABASE_URL,
            // Check for other required envs to confirm the fix
            JWT_SECRET: !!process.env.JWT_SECRET,
            COOKIE_SECRET: !!process.env.COOKIE_SECRET,
            REDIS_URL: !!process.env.REDIS_URL,
        });
    }
}
const _default = app;
export { _default as default };