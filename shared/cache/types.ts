// shared/cache/types.ts

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface CacheInvalidationEvent {
  key: string;
  namespace?: string;
  timestamp: number;
  reason: 'expired' | 'manual' | 'pattern' | 'eviction';
}

export interface WarmCacheConfig {
  keys: Array<{
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number;
    namespace?: string;
  }>;
  parallel?: boolean;
  batchSize?: number;
}

export type CacheStrategy = 
  | 'cache-aside'
  | 'write-through'
  | 'write-behind'
  | 'stampede-prevention'
  | 'proactive-refresh';

export interface CacheHealth {
  connected: boolean;
  latency: number;
  memoryUsage?: {
    used: number;
    max: number;
    percentage: number;
  };
  keyCount?: number;
  uptime?: number;
}

export default {
  CacheMetrics,
  CacheEntry,
  CacheInvalidationEvent,
  WarmCacheConfig,
  CacheStrategy,
  CacheHealth,
};
