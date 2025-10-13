// Load environment variables FIRST
import dotenv from "dotenv";
import path from "path";

console.log("🔍 DEBUG: Starting dotenv config...");
console.log("🔍 DEBUG: Current working directory:", process.cwd());
console.log("🔍 DEBUG: __dirname:", __dirname);

const envFilePath = path.resolve(__dirname, "../.env");
console.log("🔍 DEBUG: Looking for .env at:", envFilePath);

const dotenvResult = dotenv.config({ path: envFilePath });
console.log("🔍 DEBUG: Dotenv result:", dotenvResult);

console.log(
  "🔍 DEBUG: process.env keys after dotenv:",
  Object.keys(process.env).filter(
    (key) =>
      key.includes("DATABASE") ||
      key.includes("JWT") ||
      key.includes("COOKIE") ||
      key.includes("REDIS") ||
      key.includes("STRIPE"),
  ),
);

import { z } from "zod";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Server Configuration
  PORT: z.string().default("3000"),
  HOST: z.string().default("0.0.0.0"),
  API_PREFIX: z.string().default("/api/v1"),

  // Database
  DATABASE_URL: z.string().url("Invalid database URL"),
  DATABASE_SSL: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  // Authentication
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  // Cookies
  COOKIE_SECRET: z
    .string()
    .min(32, "Cookie secret must be at least 32 characters"),
  COOKIE_DOMAIN: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default("*"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"), // 15 minutes
  RATE_LIMIT_MAX: z.string().default("100"),

  // External Services
  REDIS_URL: z.string().url("Invalid Redis URL"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "Invalid Stripe secret key"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CDN_URL: z.string().optional(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  // Security
  SECURITY_HEADERS_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  SECURITY_CSP_REPORT_ONLY: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  // Feature Flags
  ENABLE_SWAGGER: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_REQUEST_LOGGING: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
});

export type EnvVars = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = (() => {
  console.log("🔍 DEBUG: About to parse env schema...");
  console.log("🔍 DEBUG: DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("🔍 DEBUG: JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("🔍 DEBUG: COOKIE_SECRET exists:", !!process.env.COOKIE_SECRET);
  console.log("🔍 DEBUG: REDIS_URL exists:", !!process.env.REDIS_URL);
  console.log(
    "🔍 DEBUG: STRIPE_SECRET_KEY exists:",
    !!process.env.STRIPE_SECRET_KEY,
  );

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables detected.");
      console.error("🔍 DEBUG: Full process.env:", process.env);
      console.error(
        error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join("\n"),
      );
      process.exit(1);
    }
    throw error;
  }
})();
