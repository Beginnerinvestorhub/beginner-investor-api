"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = exports.logWarn = exports.logInfo = exports.logError = exports.addRequestContext = exports.logger = void 0;
const winston_1 = require("winston");
// Create Winston logger for Node.js/TypeScript services
exports.logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json()),
    defaultMeta: { service: 'shared-utils' },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston_1.transports.File({ filename: 'logs/combined.log' }),
    ],
});
// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
    }));
}
// Middleware to add request context to logs
const addRequestContext = (req, res, next) => {
    // Add request ID if not present
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = generateRequestId();
    }
    const requestId = req.headers['x-request-id'];
    const userAgent = req.get('User-Agent') || 'Unknown';
    // Add context to logger
    exports.logger.defaultMeta = {
        ...exports.logger.defaultMeta,
        requestId,
        userAgent,
        ip: req.ip,
        method: req.method,
        url: req.url,
    };
    next();
};
exports.addRequestContext = addRequestContext;
function generateRequestId() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
// Helper functions for common logging patterns
const logError = (error, context) => {
    exports.logger.error('Error occurred', {
        error: error.message,
        stack: error.stack,
        context,
    });
};
exports.logError = logError;
const logInfo = (message, meta) => {
    exports.logger.info(message, meta);
};
exports.logInfo = logInfo;
const logWarn = (message, meta) => {
    exports.logger.warn(message, meta);
};
exports.logWarn = logWarn;
const logDebug = (message, meta) => {
    exports.logger.debug(message, meta);
};
exports.logDebug = logDebug;
exports.default = exports.logger;
