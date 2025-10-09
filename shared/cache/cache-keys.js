"use strict";
// shared/cache/cache-keys.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = exports.CacheTTL = exports.CacheNamespaces = void 0;
/**
 * Centralized cache key definitions for the Beginner Investor Hub
 * This ensures consistent key naming across all microservices
 */
exports.CacheNamespaces = {
    MARKET_DATA: 'market',
    USER: 'user',
    PORTFOLIO: 'portfolio',
    RISK: 'risk',
    AI: 'ai',
    SIMULATION: 'simulation',
    AUTH: 'auth',
    RATE_LIMIT: 'ratelimit',
};
exports.CacheTTL = {
    ONE_MINUTE: 60,
    FIVE_MINUTES: 300,
    FIFTEEN_MINUTES: 900,
    THIRTY_MINUTES: 1800,
    ONE_HOUR: 3600,
    SIX_HOURS: 21600,
    ONE_DAY: 86400,
    ONE_WEEK: 604800,
};
class CacheKeys {
    // Utility method to generate a custom key
    static custom(namespace, ...parts) {
        return `${namespace}:${parts.join(':')}`;
    }
    // Helper to generate a lock key for distributed locking
    static lock(resource) {
        return `lock:${resource}`;
    }
}
exports.CacheKeys = CacheKeys;
// Market Data Keys
CacheKeys.marketData = {
    quote: (symbol) => `${exports.CacheNamespaces.MARKET_DATA}:quote:${symbol}`,
    historicalPrices: (symbol, range) => `${exports.CacheNamespaces.MARKET_DATA}:historical:${symbol}:${range}`,
    tickerSearch: (query) => `${exports.CacheNamespaces.MARKET_DATA}:search:${query}`,
    companyInfo: (symbol) => `${exports.CacheNamespaces.MARKET_DATA}:company:${symbol}`,
    marketStatus: () => `${exports.CacheNamespaces.MARKET_DATA}:status`,
    topMovers: (type) => `${exports.CacheNamespaces.MARKET_DATA}:movers:${type}`,
};
// User Keys
CacheKeys.user = {
    profile: (userId) => `${exports.CacheNamespaces.USER}:profile:${userId}`,
    preferences: (userId) => `${exports.CacheNamespaces.USER}:prefs:${userId}`,
    session: (sessionId) => `${exports.CacheNamespaces.USER}:session:${sessionId}`,
};
// Portfolio Keys
CacheKeys.portfolio = {
    holdings: (userId) => `${exports.CacheNamespaces.PORTFOLIO}:holdings:${userId}`,
    performance: (userId, period) => `${exports.CacheNamespaces.PORTFOLIO}:perf:${userId}:${period}`,
    allocation: (userId) => `${exports.CacheNamespaces.PORTFOLIO}:allocation:${userId}`,
    transactions: (userId) => `${exports.CacheNamespaces.PORTFOLIO}:txns:${userId}`,
};
// Risk Engine Keys
CacheKeys.risk = {
    profile: (userId) => `${exports.CacheNamespaces.RISK}:profile:${userId}`,
    score: (portfolioId) => `${exports.CacheNamespaces.RISK}:score:${portfolioId}`,
    metrics: (portfolioId) => `${exports.CacheNamespaces.RISK}:metrics:${portfolioId}`,
    volatility: (symbol) => `${exports.CacheNamespaces.RISK}:volatility:${symbol}`,
};
// AI Service Keys
CacheKeys.ai = {
    nudge: (userId, context) => `${exports.CacheNamespaces.AI}:nudge:${userId}:${context}`,
    recommendation: (userId, symbol) => `${exports.CacheNamespaces.AI}:rec:${userId}:${symbol}`,
    analysis: (symbol) => `${exports.CacheNamespaces.AI}:analysis:${symbol}`,
};
// Simulation Keys
CacheKeys.simulation = {
    result: (simulationId) => `${exports.CacheNamespaces.SIMULATION}:result:${simulationId}`,
    scenario: (userId, scenarioId) => `${exports.CacheNamespaces.SIMULATION}:scenario:${userId}:${scenarioId}`,
};
// Auth Keys
CacheKeys.auth = {
    token: (tokenHash) => `${exports.CacheNamespaces.AUTH}:token:${tokenHash}`,
    refresh: (userId) => `${exports.CacheNamespaces.AUTH}:refresh:${userId}`,
    blacklist: (tokenId) => `${exports.CacheNamespaces.AUTH}:blacklist:${tokenId}`,
};
// Rate Limiting Keys
CacheKeys.rateLimit = {
    ip: (ip, endpoint) => `${exports.CacheNamespaces.RATE_LIMIT}:ip:${ip}:${endpoint}`,
    user: (userId, endpoint) => `${exports.CacheNamespaces.RATE_LIMIT}:user:${userId}:${endpoint}`,
    api: (apiKey) => `${exports.CacheNamespaces.RATE_LIMIT}:api:${apiKey}`,
};
exports.default = CacheKeys;
