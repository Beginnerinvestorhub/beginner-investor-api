import { Request, Response } from 'express';
import { logger } from '../tools/shared/utils/logger';
import { redisManager } from '../tools/shared/redis';
import { cacheService } from '../tools/shared/cache';

// Track metrics in memory for the current process
const metrics = {
  requests: 0,
  errors: 0,
  cacheHits: 0,
  cacheMisses: 0,
  responseTimes: [] as number[],
  lastError: null as Error | null,
  startupTime: new Date(),
};

// Track external service status
const serviceStatus = new Map<string, {
  lastCheck: Date;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  error?: string;
}>();

class MonitoringService {
  /**
   * Track API request metrics
   */
  trackRequest(req: Request, res: Response, responseTime: number) {
    metrics.requests++;
    metrics.responseTimes.push(responseTime);
    
    // Keep only the last 1000 response times
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }
    
    // Log slow requests
    if (responseTime > 1000) { // 1 second
      logger.warn('Slow request detected', {
        path: req.path,
        method: req.method,
        duration: `${responseTime}ms`,
        userAgent: req.headers['user-agent'],
      });
    }
  }

  /**
   * Track errors
   */
  trackError(error: Error) {
    metrics.errors++;
    metrics.lastError = error;
    
    logger.error('Application error:', error);
    
    // TODO: Add error reporting to external service (e.g., Sentry)
  }

  /**
   * Track cache hits and misses
   */
  trackCacheHit() {
    metrics.cacheHits++;
  }

  trackCacheMiss() {
    metrics.cacheMisses++;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const responseTimes = metrics.responseTimes;
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    
    return {
      requests: metrics.requests,
      errors: metrics.errors,
      cache: {
        hits: metrics.cacheHits,
        misses: metrics.cacheMisses,
        hitRate: metrics.cacheHits + metrics.cacheMisses > 0
          ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100
          : 0,
      },
      responseTime: {
        average: avgResponseTime,
        p50: this.percentile(50, responseTimes),
        p90: this.percentile(90, responseTimes),
        p99: this.percentile(99, responseTimes),
        max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      lastError: metrics.lastError?.message,
      timestamp: new Date(),
    };
  }

  /**
   * Check external service status
   */
  async checkServiceHealth(serviceName: string, checkFn: () => Promise<boolean>) {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    let error: string | undefined;
    
    try {
      const isHealthy = await checkFn();
      status = isHealthy ? 'healthy' : 'degraded';
    } catch (err) {
      status = 'down';
      error = err instanceof Error ? err.message : 'Unknown error';
    }
    
    const responseTime = Date.now() - startTime;
    
    serviceStatus.set(serviceName, {
      lastCheck: new Date(),
      status,
      responseTime,
      error,
    });
    
    return { status, responseTime, error };
  }

  /**
   * Get service status
   */
  getServiceStatus(serviceName?: string) {
    if (serviceName) {
      return serviceStatus.get(serviceName);
    }
    return Object.fromEntries(serviceStatus.entries());
  }

  /**
   * Health check endpoint handler
   */
  async healthCheck(req: Request, res: Response) {
    try {
      // Check Redis connection
      await redisManager.getClient().ping();
      
      // Check cache service
      const cacheKey = 'health:check';
      await cacheService.set(cacheKey, 'ok', { ttl: 60 });
      const cacheValue = await cacheService.get(cacheKey);
      
      if (cacheValue !== 'ok') {
        throw new Error('Cache service check failed');
      }
      
      // TODO: Add more health checks as needed
      
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        checks: {
          redis: 'ok',
          cache: 'ok',
          // Add more checks here
        },
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'error',
        error: 'Service Unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Metrics endpoint handler
   */
  metricsEndpoint(req: Request, res: Response) {
    try {
      res.json({
        ...this.getMetrics(),
        services: this.getServiceStatus(),
      });
    } catch (error) {
      logger.error('Metrics endpoint error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Helper to calculate percentiles
   */
  private percentile(p: number, values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
}

// Export a singleton instance
export const monitoringService = new MonitoringService();

// Middleware to track request metrics
export const monitorRequest = (req: Request, res: Response, next: () => void) => {
  const startTime = Date.now();
  
  // Override res.end to track response time
  const originalEnd = res.end;
  res.end = ((...args: any[]) => {
    const responseTime = Date.now() - startTime;
    monitoringService.trackRequest(req, res, responseTime);
    
    // Restore original end function
    res.end = originalEnd;
    return res.end(...args);
  }) as any;
  
  next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: (err?: any) => void) => {
  monitoringService.trackError(err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default monitoringService;
