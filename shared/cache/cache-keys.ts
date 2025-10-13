// shared/cache/cache-keys.ts

/**
 * Centralized cache key definitions for the Beginner Investor Hub
 * This ensures consistent key naming across all microservices
 */

export const CacheNamespaces = {
  MARKET_DATA: 'market',
  USER: 'user',
  PORTFOLIO: 'portfolio',
  RISK: 'risk',
  AI: 'ai',
  SIMULATION: 'simulation',
  AUTH: 'auth',
  RATE_LIMIT: 'ratelimit',
} as const;

export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
} as const;

export class CacheKeys {
  // Market Data Keys
  static marketData = {
    quote: (symbol: string) => `${CacheNamespaces.MARKET_DATA}:quote:${symbol}`,
    historicalPrices: (symbol: string, range: string) =>
      `${CacheNamespaces.MARKET_DATA}:historical:${symbol}:${range}`,
    tickerSearch: (query: string) => `${CacheNamespaces.MARKET_DATA}:search:${query}`,
    companyInfo: (symbol: string) => `${CacheNamespaces.MARKET_DATA}:company:${symbol}`,
    marketStatus: () => `${CacheNamespaces.MARKET_DATA}:status`,
    topMovers: (type: 'gainers' | 'losers') => `${CacheNamespaces.MARKET_DATA}:movers:${type}`,
  };

  // User Keys
  static user = {
    profile: (userId: string) => `${CacheNamespaces.USER}:profile:${userId}`,
    preferences: (userId: string) => `${CacheNamespaces.USER}:prefs:${userId}`,
    session: (sessionId: string) => `${CacheNamespaces.USER}:session:${sessionId}`,
  };

  // Portfolio Keys
  static portfolio = {
    holdings: (userId: string) => `${CacheNamespaces.PORTFOLIO}:holdings:${userId}`,
    performance: (userId: string, period: string) =>
      `${CacheNamespaces.PORTFOLIO}:perf:${userId}:${period}`,
    allocation: (userId: string) => `${CacheNamespaces.PORTFOLIO}:allocation:${userId}`,
    transactions: (userId: string) => `${CacheNamespaces.PORTFOLIO}:txns:${userId}`,
  };

  // Risk Engine Keys
  static risk = {
    profile: (userId: string) => `${CacheNamespaces.RISK}:profile:${userId}`,
    score: (portfolioId: string) => `${CacheNamespaces.RISK}:score:${portfolioId}`,
    metrics: (portfolioId: string) => `${CacheNamespaces.RISK}:metrics:${portfolioId}`,
    volatility: (symbol: string) => `${CacheNamespaces.RISK}:volatility:${symbol}`,
  };

  // AI Service Keys
  static ai = {
    nudge: (userId: string, context: string) => `${CacheNamespaces.AI}:nudge:${userId}:${context}`,
    recommendation: (userId: string, symbol: string) =>
      `${CacheNamespaces.AI}:rec:${userId}:${symbol}`,
    analysis: (symbol: string) => `${CacheNamespaces.AI}:analysis:${symbol}`,
  };

  // Simulation Keys
  static simulation = {
    result: (simulationId: string) => `${CacheNamespaces.SIMULATION}:result:${simulationId}`,
    scenario: (userId: string, scenarioId: string) =>
      `${CacheNamespaces.SIMULATION}:scenario:${userId}:${scenarioId}`,
  };

  // Auth Keys
  static auth = {
    token: (tokenHash: string) => `${CacheNamespaces.AUTH}:token:${tokenHash}`,
    refresh: (userId: string) => `${CacheNamespaces.AUTH}:refresh:${userId}`,
    blacklist: (tokenId: string) => `${CacheNamespaces.AUTH}:blacklist:${tokenId}`,
  };

  // Rate Limiting Keys
  static rateLimit = {
    ip: (ip: string, endpoint: string) => `${CacheNamespaces.RATE_LIMIT}:ip:${ip}:${endpoint}`,
    user: (userId: string, endpoint: string) =>
      `${CacheNamespaces.RATE_LIMIT}:user:${userId}:${endpoint}`,
    api: (apiKey: string) => `${CacheNamespaces.RATE_LIMIT}:api:${apiKey}`,
  };

  // Utility method to generate a custom key
  static custom(namespace: string, ...parts: string[]): string {
    return `${namespace}:${parts.join(':')}`;
  }

  // Helper to generate a lock key for distributed locking
  static lock(resource: string): string {
    return `lock:${resource}`;
  }
}

export default CacheKeys;
