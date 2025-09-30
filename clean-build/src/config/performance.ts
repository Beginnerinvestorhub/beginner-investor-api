import { env } from './env.schema';

/**
 * Performance configuration for the application
 * Adjust these values based on your deployment environment and requirements
 */
export const performanceConfig = {
  // Cache settings
  cache: {
    // Default TTL in seconds
    defaultTtl: env.NODE_ENV === 'production' ? 300 : 60, // 5 minutes in production, 1 minute in development
    
    // Cache size limits
    maxMemoryCacheSize: env.NODE_ENV === 'production' ? '100mb' : '50mb',
    
    // Cache groups
    groups: {
      user: {
        ttl: 3600, // 1 hour
        maxItems: 10000,
      },
      leaderboard: {
        ttl: 300, // 5 minutes
        maxItems: 100,
      },
      content: {
        ttl: 1800, // 30 minutes
        maxItems: 5000,
      },
    },
  },
  
  // Database settings
  database: {
    // Connection pool settings
    pool: {
      min: env.NODE_ENV === 'production' ? 2 : 1,
      max: env.NODE_ENV === 'production' ? 10 : 5,
      idleTimeout: 30000, // 30 seconds
      connectionTimeout: 2000, // 2 seconds
    },
    
    // Query optimization
    query: {
      slowQueryThreshold: 100, // ms
      maxQueryTime: 10000, // 10 seconds
      logSlowQueries: true,
      explainQueries: env.NODE_ENV === 'development',
    },
  },
  
  // Rate limiting
  rateLimiting: {
    enabled: env.NODE_ENV === 'production',
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
  },
  
  // Compression
  compression: {
    enabled: true,
    threshold: '1kb',
    level: 6, // 0 (no compression) to 9 (maximum compression)
  },
  
  // Request/response optimization
  optimization: {
    // Enable response compression
    compressResponses: true,
    
    // Remove unnecessary headers
    removeUnnecessaryHeaders: true,
    
    // Enable ETag generation
    etag: true,
    
    // Enable response caching
    cacheControl: true,
  },
  
  // Monitoring and metrics
  monitoring: {
    // Enable performance metrics collection
    enabled: true,
    
    // Metrics collection interval (milliseconds)
    collectionInterval: 5 * 60 * 1000, // 5 minutes
    
    // Log slow requests (milliseconds)
    slowRequestThreshold: 500, // 0.5 seconds
    
    // Log large responses (bytes)
    largeResponseThreshold: 1024 * 1024, // 1MB
  },
  
  // CDN and static assets
  cdn: {
    enabled: env.NODE_ENV === 'production',
    url: env.CDN_URL || '',
    // Cache static assets for 1 year (browser cache)
    maxAge: 31536000,
  },
  
  // Web vitals
  webVitals: {
    // Track Core Web Vitals
    enabled: true,
    
    // Thresholds for Core Web Vitals (milliseconds)
    thresholds: {
      // Largest Contentful Paint
      lcp: 2500, // 2.5 seconds
      // First Input Delay
      fid: 100, // 100ms
      // Cumulative Layout Shift
      cls: 0.1, // 0.1 or less
      // First Contentful Paint
      fcp: 1800, // 1.8 seconds
      // Time to First Byte
      ttfb: 200, // 200ms
    },
  },
} as const;

/**
 * Get cache TTL for a specific group
 */
export function getCacheTtl(group?: keyof typeof performanceConfig.cache.groups): number {
  if (group && performanceConfig.cache.groups[group]) {
    return performanceConfig.cache.groups[group].ttl;
  }
  return performanceConfig.cache.defaultTtl;
}

/**
 * Check if performance monitoring is enabled
 */
export function isMonitoringEnabled(): boolean {
  return performanceConfig.monitoring.enabled;
}

/**
 * Check if query explanation is enabled
 */
export function isQueryExplainEnabled(): boolean {
  return performanceConfig.database.query.explainQueries;
}

/**
 * Get the slow query threshold in milliseconds
 */
export function getSlowQueryThreshold(): number {
  return performanceConfig.database.query.slowQueryThreshold;
}

/**
 * Get rate limiting configuration
 */
export function getRateLimitConfig() {
  return {
    windowMs: performanceConfig.rateLimiting.windowMs,
    max: performanceConfig.rateLimiting.max,
    message: performanceConfig.rateLimiting.message,
  };
}

/**
 * Get compression configuration
 */
export function getCompressionConfig() {
  return {
    level: performanceConfig.compression.level,
    threshold: performanceConfig.compression.threshold,
  };
}

/**
 * Get Web Vitals thresholds
 */
export function getWebVitalsThresholds() {
  return performanceConfig.webVitals.thresholds;
}
