export declare const CacheNamespaces: {
    readonly MARKET_DATA: "market";
    readonly USER: "user";
    readonly PORTFOLIO: "portfolio";
    readonly RISK: "risk";
    readonly AI: "ai";
    readonly SIMULATION: "simulation";
    readonly AUTH: "auth";
    readonly RATE_LIMIT: "ratelimit";
};
export declare const CacheTTL: {
    readonly ONE_MINUTE: 60;
    readonly FIVE_MINUTES: 300;
    readonly FIFTEEN_MINUTES: 900;
    readonly THIRTY_MINUTES: 1800;
    readonly ONE_HOUR: 3600;
    readonly SIX_HOURS: 21600;
    readonly ONE_DAY: 86400;
    readonly ONE_WEEK: 604800;
};
export declare class CacheKeys {
    static marketData: {
        quote: (symbol: string) => string;
        historicalPrices: (symbol: string, range: string) => string;
        tickerSearch: (query: string) => string;
        companyInfo: (symbol: string) => string;
        marketStatus: () => string;
        topMovers: (type: "gainers" | "losers") => string;
    };
    static user: {
        profile: (userId: string) => string;
        preferences: (userId: string) => string;
        session: (sessionId: string) => string;
    };
    static portfolio: {
        holdings: (userId: string) => string;
        performance: (userId: string, period: string) => string;
        allocation: (userId: string) => string;
        transactions: (userId: string) => string;
    };
    static risk: {
        profile: (userId: string) => string;
        score: (portfolioId: string) => string;
        metrics: (portfolioId: string) => string;
        volatility: (symbol: string) => string;
    };
    static ai: {
        nudge: (userId: string, context: string) => string;
        recommendation: (userId: string, symbol: string) => string;
        analysis: (symbol: string) => string;
    };
    static simulation: {
        result: (simulationId: string) => string;
        scenario: (userId: string, scenarioId: string) => string;
    };
    static auth: {
        token: (tokenHash: string) => string;
        refresh: (userId: string) => string;
        blacklist: (tokenId: string) => string;
    };
    static rateLimit: {
        ip: (ip: string, endpoint: string) => string;
        user: (userId: string, endpoint: string) => string;
        api: (apiKey: string) => string;
    };
    static custom(namespace: string, ...parts: string[]): string;
    static lock(resource: string): string;
}
export default CacheKeys;
//# sourceMappingURL=cache-keys.d.ts.map