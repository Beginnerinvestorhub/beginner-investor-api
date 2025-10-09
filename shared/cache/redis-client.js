"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
// shared/cache/redis-client.ts
const ioredis_1 = __importDefault(require("ioredis"));
class RedisClient {
    static initialize(config) {
        if (this.instance) {
            console.warn('Redis client already initialized. Returning existing instance.');
            return this.instance;
        }
        this.config = config;
        try {
            if (config.url) {
                this.instance = new ioredis_1.default(config.url, {
                    keyPrefix: config.keyPrefix || 'bih:',
                    retryStrategy: config.retryStrategy || this.defaultRetryStrategy,
                    maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
                });
            }
            else {
                this.instance = new ioredis_1.default({
                    host: config.host || 'localhost',
                    port: config.port || 6379,
                    password: config.password,
                    db: config.db || 0,
                    keyPrefix: config.keyPrefix || 'bih:',
                    retryStrategy: config.retryStrategy || this.defaultRetryStrategy,
                    maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
                });
            }
            this.setupEventHandlers();
            console.log('✅ Redis client initialized successfully');
            return this.instance;
        }
        catch (error) {
            console.error('❌ Failed to initialize Redis client:', error);
            throw error;
        }
    }
    static getInstance() {
        if (!this.instance) {
            throw new Error('Redis client not initialized. Call initialize() first.');
        }
        return this.instance;
    }
    static defaultRetryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
    static setupEventHandlers() {
        if (!this.instance)
            return;
        this.instance.on('connect', () => {
            console.log('🔌 Redis client connected');
        });
        this.instance.on('ready', () => {
            console.log('✅ Redis client ready');
        });
        this.instance.on('error', (err) => {
            console.error('❌ Redis client error:', err);
        });
        this.instance.on('close', () => {
            console.log('🔌 Redis connection closed');
        });
        this.instance.on('reconnecting', () => {
            console.log('🔄 Redis client reconnecting...');
        });
    }
    static async disconnect() {
        if (this.instance) {
            await this.instance.quit();
            this.instance = null;
            console.log('👋 Redis client disconnected');
        }
    }
    static async healthCheck() {
        try {
            if (!this.instance)
                return false;
            await this.instance.ping();
            return true;
        }
        catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }
}
exports.RedisClient = RedisClient;
RedisClient.instance = null;
RedisClient.config = {};
