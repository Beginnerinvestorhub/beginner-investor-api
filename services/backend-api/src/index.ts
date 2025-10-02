import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { trackAffiliate } from './middleware/affiliate.middleware';

// Load environment variables
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('✅ ENV Check:', {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
});


const app = express();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined'));

// Trust first proxy (important if behind a reverse proxy like Nginx)
app.set('trust proxy', 1);

// Track affiliate visits on all routes
app.use(trackAffiliate);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Backend API ',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV || 'development',
    documentation: '/docs' // Link to API documentation if available
  });
});

// API Routes
const apiRouter = express.Router();

// Apply rate limiting to API routes
apiRouter.use(apiLimiter);

// Import routes
import nudgeRoutes from './routes/nudge.routes';
import paywallRoutes from './routes/paywall.routes';
import affiliateRoutes from './routes/affiliate.routes';

// Use routes
apiRouter.use('/nudges', nudgeRoutes);
apiRouter.use('/paywall', paywallRoutes);
apiRouter.use('/affiliate', affiliateRoutes);

// Mount API routes
app.use('/api/v1', apiRouter);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Not Found',
    path:_req.path
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (for Docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

export default app;
