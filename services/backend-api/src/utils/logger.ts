import winston from "winston";
import { env } from "../config/env.schema";

const { combine, timestamp, printf, colorize, align } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length
    ? `\n${JSON.stringify(meta, null, 2)}`
    : "";
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL || "info",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    align(),
    logFormat,
  ),
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        align(),
        logFormat,
      ),
    }),
    // File transport for production
    ...(env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: combine(timestamp(), winston.format.json()),
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
            format: combine(timestamp(), winston.format.json()),
          }),
        ]
      : []),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// Create a stream object with a 'write' function that will be used by `morgan`
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Handle uncaught exceptions and unhandled rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection at:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

export default logger;
