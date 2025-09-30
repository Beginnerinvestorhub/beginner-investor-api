import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Server Configuration
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  DATABASE_SSL: z.string().default('false').transform(v => v === 'true'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // Cookies
  COOKIE_SECRET: z.string().min(32, 'Cookie secret must be at least 32 characters'),
  COOKIE_DOMAIN: z.string().optional(),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100'),
  
  // External Services
  REDIS_URL: z.string().url('Invalid Redis URL'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // Security
  SECURITY_HEADERS_ENABLED: z.string().default('true').transform(v => v === 'true'),
  SECURITY_CSP_REPORT_ONLY: z.string().default('false').transform(v => v === 'true'),
  
  // Feature Flags
  ENABLE_SWAGGER: z.string().default('true').transform(v => v === 'true'),
  ENABLE_REQUEST_LOGGING: z.string().default('true').transform(v => v === 'true'),
});

export type EnvVars = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.errors);
      process.exit(1);
    }
    throw error;
  }
})();

// Helper to generate .env.example
export function generateEnvExample() {
  const example: Record<string, string> = {};
  
  for (const [key, schema] of Object.entries(envSchema.shape)) {
    const defaultValue = schema instanceof z.ZodDefault ? schema._def.defaultValue() : undefined;
    const isRequired = !(schema.isOptional() || defaultValue !== undefined);
    
    example[`# ${key}${isRequired ? ' (required)' : ''}`] = 
      isRequired ? '' : `=${JSON.stringify(defaultValue)}`;
  }
  
  return Object.entries(example)
    .map(([key, value]) => `${key}${value}`)
    .join('\n');
}
