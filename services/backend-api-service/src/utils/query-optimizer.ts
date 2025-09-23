import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { logger } from './logger';

type QueryInfo = {
  model: string;
  action: string;
  duration: number;
  sql: string;
  params: string;
  timestamp: Date;
};

class QueryOptimizer {
  private slowQueryThreshold: number;
  private queryLog: QueryInfo[];
  private maxQueryLogSize: number;

  constructor() {
    this.slowQueryThreshold = 100; // ms
    this.maxQueryLogSize = 1000;
    this.queryLog = [];
    
    this.setupQueryLogging();
  }

  private setupQueryLogging() {
    // Log all queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query' as any, (e: any) => {
        const queryInfo: QueryInfo = {
          model: e.model || 'unknown',
          action: e.action || 'unknown',
          duration: e.duration,
          sql: e.query,
          params: e.params,
          timestamp: new Date(),
        };

        // Log slow queries
        if (queryInfo.duration > this.slowQueryThreshold) {
          logger.warn('Slow query detected:', {
            duration: `${queryInfo.duration}ms`,
            model: queryInfo.model,
            action: queryInfo.action,
            sql: queryInfo.sql,
          });
        }

        // Add to query log
        this.queryLog.push(queryInfo);
        
        // Limit log size
        if (this.queryLog.length > this.maxQueryLogSize) {
          this.queryLog.shift();
        }
      });
    }
  }

  /**
   * Get query performance statistics
   */
  public getQueryStats() {
    const stats = {
      totalQueries: this.queryLog.length,
      slowQueries: this.queryLog.filter(q => q.duration > this.slowQueryThreshold).length,
      averageDuration: this.queryLog.reduce((sum, q) => sum + q.duration, 0) / Math.max(1, this.queryLog.length),
      queriesByModel: this.groupByModel(),
      slowestQueries: this.getSlowestQueries(10),
    };

    return stats;
  }

  /**
   * Group queries by model and action
   */
  private groupByModel() {
    const groups: Record<string, {
      count: number;
      avgDuration: number;
      maxDuration: number;
      actions: Record<string, number>;
    }> = {};

    this.queryLog.forEach(query => {
      if (!groups[query.model]) {
        groups[query.model] = {
          count: 0,
          avgDuration: 0,
          maxDuration: 0,
          actions: {},
        };
      }

      const model = groups[query.model];
      model.count++;
      model.avgDuration = (model.avgDuration * (model.count - 1) + query.duration) / model.count;
      model.maxDuration = Math.max(model.maxDuration, query.duration);
      
      // Track actions
      if (!model.actions[query.action]) {
        model.actions[query.action] = 0;
      }
      model.actions[query.action]++;
    });

    return groups;
  }

  /**
   * Get the slowest queries
   */
  private getSlowestQueries(limit: number = 10): QueryInfo[] {
    return [...this.queryLog]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Add an index hint to a query
   */
  public withIndex<T>(query: T, indexName: string): T & { hint?: string } {
    return {
      ...query,
      hint: `/*+ INDEX(${indexName}) */`,
    } as any;
  }

  /**
   * Optimize a query by adding conditions
   */
  public optimizeQuery<T>(query: T, options: {
    limit?: number;
    selectOnlyNeededFields?: boolean;
    useCursorPagination?: boolean;
    lastId?: string | number;
  } = {}): T {
    const optimized: any = { ...query };

    // Add limit if specified
    if (options.limit !== undefined) {
      optimized.take = options.limit;
    }

    // Select only needed fields
    if (options.selectOnlyNeededFields && !optimized.select) {
      // Default to only selecting ID if no specific fields are selected
      optimized.select = { id: true };
    }

    // Use cursor-based pagination for better performance with large datasets
    if (options.useCursorPagination && options.lastId) {
      optimized.cursor = { id: options.lastId };
      optimized.skip = 1; // Skip the cursor itself
    }

    return optimized as T;
  }

  /**
   * Analyze a query's execution plan
   */
  public async analyzeQuery(query: string, params: any[] = []) {
    try {
      // PostgreSQL specific EXPLAIN ANALYZE
      const explainQuery = `EXPLAIN ANALYZE ${query}`;
      const result = await prisma.$queryRawUnsafe(explainQuery, ...params);
      
      return {
        success: true,
        analysis: result,
        recommendations: this.generateRecommendations(result),
      };
    } catch (error) {
      logger.error('Query analysis failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate optimization recommendations based on query analysis
   */
  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    // Check for sequential scans
    if (JSON.stringify(analysis).includes('Seq Scan')) {
      recommendations.push('Consider adding an index to improve this sequential scan');
    }

    // Check for missing indexes
    if (JSON.stringify(analysis).includes('never executed')) {
      recommendations.push('This query was never executed in the analyzed plan');
    }

    // Check for expensive operations
    if (JSON.stringify(analysis).includes('Sort') || JSON.stringify(analysis).includes('Sort Method')) {
      recommendations.push('Sorting operation detected. Consider adding an index on the sort columns');
    }

    if (JSON.stringify(analysis).includes('Hash Join')) {
      recommendations.push('Hash join detected. Ensure join columns are properly indexed');
    }

    return recommendations.length > 0 ? recommendations : ['No specific recommendations available'];
  }
}

// Export a singleton instance
export const queryOptimizer = new QueryOptimizer();

// Example usage:
/*
// In your route handler:
const users = await prisma.user.findMany(
  queryOptimizer.optimizeQuery(
    { where: { active: true } },
    { limit: 100, selectOnlyNeededFields: true }
  )
);
*/
