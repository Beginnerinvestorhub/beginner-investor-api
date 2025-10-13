import pino from 'pino';
import pinoPretty from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';

const prettyPrint = isProduction
  ? false
  : {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    };

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      remove: true,
    },
  },
  isProduction
    ? pino.destination({
        dest: 'logs/app.log',
        sync: false,
      })
    : pinoPretty({
        colorize: true,
        ...prettyPrint,
      })
);

// Create a child logger for HTTP requests
export const httpLogger = logger.child({ module: 'http' });

// Create a child logger for database operations
export const dbLogger = logger.child({ module: 'database' });

// Create a child logger for application specific logs
export const appLogger = logger.child({ module: 'app' });

export default logger;
