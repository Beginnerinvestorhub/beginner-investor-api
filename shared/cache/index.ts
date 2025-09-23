import { redisManager } from '../redis';
import { logger } from '../utils/logger';

type CacheOptions = {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Namespace for the cache key
  bypass?: boolean; // Bypass cache (useful for development)
};

// Cache key generators for different types of data
const cacheKeys = {
  // Market Data
  marketPrice: (symbol: string) => `market:price:${symbol.toLowerCase()}`,
  marketIndicators: (timeframe: string) => `market:indicators:${timeframe}`,
  
  // AI Service
  aiResponse: (promptHash: string, model: string = 'gpt-4') => `ai:response:${model}:${promptHash}`,
  openaiRateLimit: (userId: string) => `rate_limit:openai:${userId}`,
  userBehavior: (userId: string, patternType: string) => `user:behavior:${userId}:${patternType}`,
  
  // Risk Engine
  riskCalculation: (portfolioHash: string, timeframe: string) => 
    `risk:calc:${portfolioHash}:${timeframe}`,
  modelCache: (modelType: string, params: Record<string, any>) => 
    `model:${modelType}:${JSON.stringify(params)}`,
  correlationMatrix: (assets: string[], period: string) => 
    `correlation:${assets.sort().join(',')}:${period}`,
  
  // Portfolio Simulation
  simulation: (portfolioHash: string, params: Record<string, any>) => 
    `simulation:${portfolioHash}:${JSON.stringify(params)}`,
  monteCarlo: (portfolio: string, iterations: number) => 
    `sim:montecarlo:${portfolio}:${iterations}`,
  backtest: (strategy: string, period: string) => 
    `sim:backtest:${strategy}:${period}`,
  
  // User Session
  userSession: (userId: string) => `session:${userId}`,
  apiResponse: (endpoint: string, userId: string) => `cache:api:${endpoint}:${userId}`,
  rateLimit: (userId: string) => `rate_limit:api:${userId}`,
};

class CacheService {
  public keys = cacheKeys;
  
  /**
   * Get a value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (options.bypass) return null;
    
    try {
      const fullKey = this.getFullKey(key, options.namespace);
      const value = await redisManager.getClient().get(fullKey);
      
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        logger.error('Cache parse error:', { key, error });
        return null;
      }
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }
  
  /**
   * Set a value in cache
   */
  async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (options.bypass) return true;
    
    try {
      const fullKey = this.getFullKey(key, options.namespace);
      const serialized = JSON.stringify(value);
      
      if (options.ttl) {
        await redisManager.getClient().setEx(fullKey, options.ttl, serialized);
      } else {
        await redisManager.getClient().set(fullKey, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache set error:', { key, error });
      return false;
    }
  }
  
  /**
   * Delete a value from cache
   */
  async delete(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key, namespace);
      const result = await redisManager.getClient().del(fullKey);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
      return false;
    }
  }
  
  /**
   * Invalidate all cache entries matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await redisManager.getClient().keys(pattern);
      if (keys.length === 0) return 0;
      
      const deleted = await redisManager.getClient().del(keys);
      return deleted;
    } catch (error) {
      logger.error('Cache invalidation error:', { pattern, error });
      return 0;
    }
  }
  
  /**
   * Get a value from cache, or set it using the provided function if not found
   */
  async getOrSet<T>(
    key: string, 
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      this.trackCacheHit();
      return cached;
    }
    
    this.trackCacheMiss();
    const value = await fn();
    await this.set(key, value, options);
    return value;
  }
  
  /**
   * Generate a cache key with namespace
   */
  getFullKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }
  
  // Track cache hits and misses for monitoring
  private trackCacheHit() {
    // Could be implemented to track cache performance
  }
  
  private trackCacheMiss() {
    // Could be implemented to track cache performance
  }
}

// Export a singleton instance
export const cacheService = new CacheService();

// Helper functions for specific cache operations
export const cacheUtils = {
  // Market Data
  async getMarketPrice(symbol: string) {
    return cacheService.get<number>(cacheKeys.marketPrice(symbol));
  },
  
  async setMarketPrice(symbol: string, price: number) {
    return cacheService.set(cacheKeys.marketPrice(symbol), price, { ttl: 300 });
  },
  
  // AI Service
  async getAIResponse(promptHash: string, model: string = 'gpt-4') {
    return cacheService.get<any>(cacheKeys.aiResponse(promptHash, model));
  },
  
  async setAIResponse(promptHash: string, response: any, model: string = 'gpt-4') {
    return cacheService.set(cacheKeys.aiResponse(promptHash, model), response, { ttl: 3600 });
  },
  
  // Risk Engine
  async getRiskCalculation(portfolioHash: string, timeframe: string) {
    return cacheService.get<any>(cacheKeys.riskCalculation(portfolioHash, timeframe));
  },
  
  async setRiskCalculation(portfolioHash: string, timeframe: string, data: any) {
    return cacheService.set(cacheKeys.riskCalculation(portfolioHash, timeframe), data, { ttl: 1800 });
  },
  
  // Portfolio Simulation
  async getSimulation(portfolioHash: string, params: Record<string, any>) {
    return cacheService.get<any>(cacheKeys.simulation(portfolioHash, params));
  },
  
  async setSimulation(portfolioHash: string, params: Record<string, any>, data: any) {
    return cacheService.set(cacheKeys.simulation(portfolioHash, params), data, { ttl: 3600 });
  },
  
  // User Session
  async getUserSession(userId: string) {
    return cacheService.get<any>(cacheKeys.userSession(userId));
  },
  
  async setUserSession(userId: string, data: any) {
    return cacheService.set(cacheKeys.userSession(userId), data, { ttl: 86400 }); // 24 hours
  },
  
  // Invalidate all cache for a user (e.g., on logout or profile update)
  async invalidateUserCache(userId: string) {
    const pattern = `*:${userId}:*`;
    return cacheService.invalidatePattern(pattern);
  }
};

export default cacheService;
