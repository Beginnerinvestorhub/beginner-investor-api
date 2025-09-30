"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorHandler = exports.validateRateLimit = exports.sanitize = exports.validate = exports.ValidationError = void 0;
// Custom error class for validation errors
class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const errors = {};
        // Validate request body
        if (schema.body) {
            const { error } = schema.body.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });
            if (error) {
                errors.body = error.details.map(detail => {
                    var _a;
                    return ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.value
                    });
                });
            }
        }
        // Validate query parameters
        if (schema.query) {
            const { error } = schema.query.validate(req.query, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });
            if (error) {
                errors.query = error.details.map(detail => {
                    var _a;
                    return ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.value
                    });
                });
            }
        }
        // Validate route parameters
        if (schema.params) {
            const { error } = schema.params.validate(req.params, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });
            if (error) {
                errors.params = error.details.map(detail => {
                    var _a;
                    return ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.value
                    });
                });
            }
        }
        // If there are validation errors, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'The request contains invalid data',
                details: errors,
                timestamp: new Date().toISOString()
            });
        }
        next();
    };
};
exports.validate = validate;
// Sanitization helpers
exports.sanitize = {
    // Remove HTML tags and dangerous characters
    html: (str) => {
        return str.replace(/<[^>]*>/g, '').trim();
    },
    // Normalize email addresses
    email: (email) => {
        return email.toLowerCase().trim();
    },
    // Sanitize phone numbers
    phone: (phone) => {
        return phone.replace(/[^\d+\-\(\)\s]/g, '').trim();
    },
    // Remove SQL injection patterns
    sql: (str) => {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
            /(--|\/\*|\*\/|;)/g,
            /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi
        ];
        let sanitized = str;
        sqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        return sanitized.trim();
    }
};
// Rate limiting validation
const validateRateLimit = (windowMs, max, message) => {
    const requests = new Map();
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        // Clean up old entries
        for (const [key, value] of requests.entries()) {
            if (value.resetTime < windowStart) {
                requests.delete(key);
            }
        }
        const clientData = requests.get(clientId);
        if (!clientData) {
            requests.set(clientId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (clientData.count >= max) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: message || `Too many requests. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
        }
        clientData.count++;
        next();
    };
};
exports.validateRateLimit = validateRateLimit;
// Global error handler for validation errors
const validationErrorHandler = (error, req, res, next) => {
    if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
            error: error.name,
            message: error.message,
            details: error.details,
            timestamp: new Date().toISOString()
        });
    }
    next(error);
};
exports.validationErrorHandler = validationErrorHandler;
