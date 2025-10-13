// TypeScript configuration utilities for shared services

export interface DatabaseConfig {
  url: string;
  pool_size: number;
  max_overflow: number;
  pool_timeout: number;
  pool_recycle: number;
  echo: boolean;
}

export interface RedisConfig {
  url: string;
  retry_strategy: (retries: number) => number;
}

export interface FirebaseConfig {
  project_id: string;
  client_email: string;
  private_key: string;
}

export interface LoggingConfig {
  level: string;
  format: string;
  json_format: boolean;
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/investment_hub',
    pool_size: 5,
    max_overflow: 10,
    pool_timeout: 30,
    pool_recycle: 3600,
    echo: process.env.NODE_ENV === 'development',
  };
}

/**
 * Get Redis configuration from environment variables
 */
export function getRedisConfig(): RedisConfig {
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retry_strategy: (retries: number) => Math.min(retries * 100, 3000),
  };
}

/**
 * Get Firebase configuration from environment variables
 */
export function getFirebaseConfig(): FirebaseConfig {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

  return {
    project_id: process.env.FIREBASE_PROJECT_ID || '',
    client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
    private_key: privateKey,
  };
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return !!(config.project_id && config.client_email && config.private_key);
}

/**
 * Get logging configuration from environment variables
 */
export function getLoggingConfig(): LoggingConfig {
  return {
    level: process.env.LOG_LEVEL || 'INFO',
    format: process.env.LOG_FORMAT || 'text',
    json_format: process.env.LOG_FORMAT === 'json',
  };
}

/**
 * Validate that required environment variables are set
 */
export function validateEnvironment(): boolean {
  const required = [
    'DATABASE_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'JWT_SECRET_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Initialize application configuration
 */
export function initializeConfig(): void {
  if (!validateEnvironment()) {
    throw new Error('Invalid configuration. Please check your environment variables.');
  }

  console.log('Configuration initialized successfully');
}
