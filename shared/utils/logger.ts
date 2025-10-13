import { createLogger, format, transports } from 'winston';
import { Request, Response } from 'express';

// Create Winston logger for Node.js/TypeScript services
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: { service: 'shared-utils' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

// Middleware to add request context to logs
export const addRequestContext = (req: Request, _res: Response, next: any) => {
  // Add request ID if not present
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = generateRequestId();
  }

  const requestId = req.headers['x-request-id'] as string;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Add context to logger
  logger.defaultMeta = {
    ...logger.defaultMeta,
    requestId,
    userAgent,
    ip: req.ip,
    method: req.method,
    url: req.url,
  };

  next();
};

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper functions for common logging patterns
export const logError = (error: Error, context?: any) => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    context,
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export default logger;
