export interface CacheOptions {
    ttl?: number;
    namespace?: string;
}
export declare class CacheManager {
    private redis;
    private defaultTTL;
    constructor(defaultTTL?: number);
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    delete(key: string, options?: CacheOptions): Promise<void>;
    exists(key: string, options?: CacheOptions): Promise<boolean>;
    setMany<T>(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>, options?: CacheOptions): Promise<void>;
    getMany<T>(keys: string[], options?: CacheOptions): Promise<Map<string, T>>;
    deletePattern(pattern: string, options?: CacheOptions): Promise<number>;
    getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>;
    increment(key: string, by?: number, options?: CacheOptions): Promise<number>;
    decrement(key: string, by?: number, options?: CacheOptions): Promise<number>;
    expire(key: string, seconds: number, options?: CacheOptions): Promise<boolean>;
    ttl(key: string, options?: CacheOptions): Promise<number>;
    private buildKey;
    flushAll(): Promise<void>;
}
export default CacheManager;
//# sourceMappingURL=cache-manager.d.ts.map