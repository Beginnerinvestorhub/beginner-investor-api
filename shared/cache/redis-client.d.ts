import { RedisClientType } from 'redis';
interface RedisConfig {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    retryStrategy?: (times: number) => number | void;
    maxRetriesPerRequest?: number;
}
declare class RedisClient {
    private static instance;
    private static config;
    static initialize(config: RedisConfig): Promise<RedisClientType>;
    static getInstance(): RedisClientType;
    private static defaultRetryStrategy;
    private static setupEventHandlers;
    static disconnect(): Promise<void>;
    static healthCheck(): Promise<boolean>;
}
export { RedisClient, RedisConfig };
//# sourceMappingURL=redis-client.d.ts.map