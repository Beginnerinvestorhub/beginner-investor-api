"use strict";
// TypeScript configuration utilities for shared services
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = getDatabaseConfig;
exports.getRedisConfig = getRedisConfig;
exports.getFirebaseConfig = getFirebaseConfig;
exports.getLoggingConfig = getLoggingConfig;
exports.validateEnvironment = validateEnvironment;
exports.initializeConfig = initializeConfig;
/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig() {
    return {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/investment_hub',
        pool_size: 5,
        max_overflow: 10,
        pool_timeout: 30,
        pool_recycle: 3600,
        echo: process.env.NODE_ENV === 'development'
    };
}
/**
 * Get Redis configuration from environment variables
 */
function getRedisConfig() {
    return {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (retries) => Math.min(retries * 100, 3000)
    };
}
/**
 * Get Firebase configuration from environment variables
 */
function getFirebaseConfig() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    return {
        project_id: process.env.FIREBASE_PROJECT_ID || '',
        client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
        private_key: privateKey
    };
}
/**
 * Get logging configuration from environment variables
 */
function getLoggingConfig() {
    return {
        level: process.env.LOG_LEVEL || 'INFO',
        format: process.env.LOG_FORMAT || 'text',
        json_format: process.env.LOG_FORMAT === 'json'
    };
}
/**
 * Validate that required environment variables are set
 */
function validateEnvironment() {
    const required = [
        'DATABASE_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'JWT_SECRET_KEY'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        return false;
    }
    return true;
}
/**
 * Initialize application configuration
 */
function initializeConfig() {
    if (!validateEnvironment()) {
        throw new Error('Invalid configuration. Please check your environment variables.');
    }
    console.log('Configuration initialized successfully');
}
