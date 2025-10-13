export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: any) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
export declare class RateLimiter {
    private cacheManager;
    constructor();
    check(req: any, options: RateLimitOptions): Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        resetTime: number;
    }>;
    private defaultKeyGenerator;
    createMiddleware(options: RateLimitOptions): (req: any, res: any, next: any) => Promise<any>;
}
export declare const rateLimiter: RateLimiter;
export declare const RATE_LIMITS: {
    API: {
        windowMs: number;
        maxRequests: number;
    };
    AUTH: {
        windowMs: number;
        maxRequests: number;
    };
    MARKET_DATA: {
        windowMs: number;
        maxRequests: number;
    };
    AI_ENGINE: {
        windowMs: number;
        maxRequests: number;
    };
};
//# sourceMappingURL=rate-limiter.d.ts.map