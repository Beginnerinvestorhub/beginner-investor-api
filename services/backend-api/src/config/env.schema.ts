import { z, ZodTypeAny, ZodDefault, ZodEnum, ZodString } from 'zod';

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
      // Use process.env.NODE_ENV check to conditionally omit stack trace in production
      console.error('❌ Invalid environment variables detected.');
      console.error(error.errors.map(e => `[${e.path.join('.')}] ${e.message}`).join('\n'));
      process.exit(1);
    }
    throw error;
  }
})();

// Helper to generate .env.example
export function generateEnvExample() {
  const lines: string[] = [
    '# =========================================================================',
    '# Beginner Investor Hub API Environment Variables',
    '# This file serves as an example. Rename to .env and fill in the required values.',
    '# =========================================================================',
    ''
  ];

  for (const [key, schema] of Object.entries(envSchema.shape)) {
    // Determine the underlying schema to check for enums or requirements
    const baseSchema = schema instanceof ZodDefault ? schema.removeDefault() : schema;
    
    // 1. Get Default/Example Value
    let exampleValue: string;
    let isRequired = false;

    if (schema.isOptional() || schema.isNullable()) {
        exampleValue = ''; // Optional fields can be empty
    } else if (schema instanceof ZodDefault) {
      // Correctly retrieve default value from ZodDefault
      const defaultValue = schema._def.defaultValue();
      exampleValue = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    } else {
        // Handle required fields and provide meaningful placeholders
        isRequired = true;
        if (key.endsWith('_URL')) {
            exampleValue = 'http://localhost:5432/mydb_dev'; // Example for URL
        } else if (key.endsWith('_SECRET')) {
            exampleValue = 'replace_with_a_long_complex_random_string_64_chars_min';
        } else if (key === 'STRIPE_SECRET_KEY') {
            exampleValue = 'sk_test_...';
        } else {
            exampleValue = '';
        }
    }
    
    // 2. Generate Comment Line
    const requiredText = isRequired ? ' (REQUIRED)' : '';
    let enumText = '';
    
    if (baseSchema instanceof ZodEnum) {
        // Correctly handle ZodEnum to show possible values
        enumText = ` (Options: ${baseSchema._def.values.join(' | ')})`;
    }
    
    // 3. Add to Lines Array
    lines.push(`# ${key}${requiredText}${enumText}`);
    lines.push(`${key}=${exampleValue}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}

// Example of running the generator (if this file is executed directly)
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const exampleContent = generateEnvExample();
  
  const filePath = path.join(process.cwd(), '.env.example');
  fs.writeFileSync(filePath, exampleContent);
  
  console.log(`✅ .env.example generated successfully at: ${filePath}`);
  console.log('\n--- Content ---\n');
  console.log(exampleContent);
}