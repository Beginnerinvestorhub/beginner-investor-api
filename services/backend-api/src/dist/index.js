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
const database_1 = require("./config/database");
// Load environment variables from backend/.env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// ⚠️ Warn if Stripe key is missing (but don't crash)
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not found - Stripe functionality will be disabled');
}
// ⚠️ Warn if Database URL is missing
if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not found - Database functionality will be disabled');
}
const app = (0, express_1.default)();
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
// API Routes
const auth_1 = require("./routes/auth");
const user_1 = require("./routes/user");
const dashboard_1 = require("./routes/dashboard");
const admin_1 = require("./routes/admin");
const newsletter_1 = __importDefault(require("./routes/newsletter"));
const stripe_1 = __importDefault(require("./routes/stripe"));
const profile_1 = __importDefault(require("./routes/profile"));
const gamification_1 = __importDefault(require("./routes/gamification"));
const education_1 = require("./routes/education");
const leaderboard_1 = require("./routes/leaderboard");
const challenges_1 = require("./routes/challenges");
// OpenAPI Documentation
const swagger_1 = require("./middleware/swagger");
// API Documentation Routes (with optional authentication)
app.get('/api/docs', swagger_1.docsAuth, swagger_1.serveDocsLanding);
app.get('/api/docs/swagger', swagger_1.docsAuth, swagger_1.serveSwaggerUI);
app.get('/api/docs/redoc', swagger_1.docsAuth, swagger_1.serveReDoc);
app.get('/api/docs/openapi.json', swagger_1.serveOpenApiSpec);
// API Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/user', user_1.userRouter);
app.use('/api/dashboard', dashboard_1.dashboardRouter);
app.use('/api/admin', admin_1.adminRouter);
app.use('/api/newsletter', newsletter_1.default);
app.use('/api/stripe', stripe_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/gamification', gamification_1.default);
app.use('/api/education', education_1.educationRouter);
app.use('/api/gamification/leaderboard', leaderboard_1.leaderboardRouter);
app.use('/api/gamification/challenges', challenges_1.challengesRouter);
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
                const dbConnected = await (0, database_1.testConnection)();
                if (dbConnected) {
                    await (0, database_1.initializeDatabase)();
                    console.log('🗄️ Database initialized successfully');
                }
            }
            else {
                console.log('⚠️ Skipping database initialization - DATABASE_URL not provided');
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
        });
    }
}
exports.default = app;
