import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';
import { env } from '../config/env.schema';

// Track request statistics
const requestStats: Record<string, {
  count: number;
  totalTime: number;
  maxTime: number;
  minTime: number;
  errors: number;
}> = {};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  const path = req.path;
  const method = req.method;
  const routeKey = `${method}:${path}`;

  // Initialize route stats if not exists
  if (!requestStats[routeKey]) {
    requestStats[routeKey] = {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      minTime: Infinity,
      errors: 0,
    };
  }

  // Store the original end function
  const originalEnd = res.end;
  
  // Override the end function to track performance
  res.end = (...args: any[]) => {
    const duration = performance.now() - start;
    const routeStats = requestStats[routeKey];
    
    // Update statistics
    routeStats.count++;
    routeStats.totalTime += duration;
    routeStats.maxTime = Math.max(routeStats.maxTime, duration);
    routeStats.minTime = Math.min(routeStats.minTime, duration);
    
    // Track errors (4xx and 5xx status codes)
    if (res.statusCode >= 400) {
      routeStats.errors++;
    }

    // Log slow requests
    const slowThreshold = env.NODE_ENV === 'production' ? 1000 : 500; // ms
    if (duration > slowThreshold) {
      logger.warn(`Slow request detected: ${method} ${path} took ${duration.toFixed(2)}ms`);
    }

    // Call the original end function
    return originalEnd.apply(res, args);
  };

  next();
};

// Get performance metrics
export const getPerformanceMetrics = () => {
  const metrics = Object.entries(requestStats).map(([route, stats]) => ({
    route,
    count: stats.count,
    avgTime: stats.totalTime / stats.count,
    maxTime: stats.maxTime,
    minTime: stats.minTime,
    errorRate: (stats.errors / stats.count) * 100,
    requestsPerSecond: stats.count / (stats.totalTime / 1000),
  }));

  return metrics.sort((a, b) => b.avgTime - a.avgTime); // Sort by average time (slowest first)
};

// Log performance metrics periodically
if (env.NODE_ENV !== 'test') {
  setInterval(() => {
    const metrics = getPerformanceMetrics();
    if (metrics.length > 0) {
      logger.info('Performance Metrics:', {
        timestamp: new Date().toISOString(),
        metrics: metrics.map(m => ({
          route: m.route,
          avgTime: m.avgTime.toFixed(2) + 'ms',
          maxTime: m.maxTime.toFixed(2) + 'ms',
          errorRate: m.errorRate.toFixed(2) + '%',
          rps: m.requestsPerSecond.toFixed(2),
        })),
      });
    }
  }, 5 * 60 * 1000); // Log every 5 minutes
}

// Middleware to expose performance metrics via API
export const getPerformanceMetricsHandler = (req: Request, res: Response) => {
  const metrics = getPerformanceMetrics();
  res.json({
    status: 'success',
    data: metrics,
  });
};
