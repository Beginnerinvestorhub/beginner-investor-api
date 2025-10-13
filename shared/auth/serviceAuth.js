"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceAuth = void 0;
const crypto_1 = require("crypto");
const logger_1 = require("../utils/logger");
/**
 * Middleware to authenticate service-to-service requests
 * Uses HMAC-SHA256 for request signing
 */
class ServiceAuth {
    constructor() {
        this.algorithm = 'sha256';
        this.encoding = 'hex';
        this.headerName = 'x-service-signature';
        this.timestampHeader = 'x-service-timestamp';
        this.maxTimeDiff = 5 * 60 * 1000; // 5 minutes
        this.secret = process.env.SERVICE_AUTH_SECRET || 'default-secret';
    }
    static getInstance() {
        if (!ServiceAuth.instance) {
            ServiceAuth.instance = new ServiceAuth();
        }
        return ServiceAuth.instance;
    }
    /**
     * Generate a signature for the request
     */
    generateSignature(timestamp, body) {
        const hmac = (0, crypto_1.createHmac)(this.algorithm, this.secret);
        const data = `${timestamp}.${JSON.stringify(body)}`;
        return hmac.update(data).digest(this.encoding);
    }
    /**
     * Validate the request timestamp
     */
    validateTimestamp(timestamp) {
        try {
            const requestTime = new Date(timestamp).getTime();
            const currentTime = Date.now();
            return Math.abs(currentTime - requestTime) <= this.maxTimeDiff;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Middleware to verify service requests
     */
    verify() {
        return (req, res, next) => {
            try {
                const signature = req.header(this.headerName);
                const timestamp = req.header(this.timestampHeader);
                // Check if required headers are present
                if (!signature || !timestamp) {
                    logger_1.logger.warn('Missing required headers for service authentication');
                    return res.status(401).json({ error: 'Missing authentication headers' });
                }
                // Validate timestamp
                if (!this.validateTimestamp(timestamp)) {
                    logger_1.logger.warn('Invalid timestamp in service request');
                    return res.status(401).json({ error: 'Request expired' });
                }
                // Clone and clean the request body for signature generation
                const body = { ...req.body };
                // Remove any sensitive fields that shouldn't be part of the signature
                delete body.signature;
                delete body[this.headerName.toLowerCase()];
                // Generate expected signature
                const expectedSignature = this.generateSignature(timestamp, body);
                // Compare signatures
                if (signature !== expectedSignature) {
                    logger_1.logger.warn('Invalid service request signature');
                    return res.status(401).json({ error: 'Invalid signature' });
                }
                // Authentication successful
                next();
            }
            catch (error) {
                logger_1.logger.error('Service authentication error:', error);
                return res.status(500).json({ error: 'Authentication error' });
            }
        };
    }
    /**
     * Sign a request with the current timestamp and secret
     */
    signRequest(body) {
        const timestamp = new Date().toISOString();
        const signature = this.generateSignature(timestamp, body);
        return { signature, timestamp };
    }
    /**
     * Middleware to sign outgoing service requests
     */
    signOutgoingRequest(req, res, next) {
        const originalSend = res.send;
        // Override the response send method to sign the response
        res.send = (body) => {
            if (body) {
                const { signature, timestamp } = this.signRequest(body);
                res.setHeader(this.headerName, signature);
                res.setHeader(this.timestampHeader, timestamp);
            }
            return originalSend.call(res, body);
        };
        next();
    }
}
// Create a singleton instance
const serviceAuth = ServiceAuth.getInstance();
exports.serviceAuth = serviceAuth;
