"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
// shared/cache/redis-client.ts
const redis_1 = require("redis");
class RedisClient {
    static instance = null;
    static config = {};
    static async initialize(config) {
        if (this.instance) {
            console.warn('Redis client already initialized. Returning existing instance.');
            return this.instance;
        }
        this.config = config;
        try {
            if (config.url) {
                this.instance = (0, redis_1.createClient)({
                    url: config.url,
                    socket: {
                        reconnectStrategy: config.retryStrategy || this.defaultRetryStrategy
                    }
                });
            }
            else {
                this.instance = (0, redis_1.createClient)({
                    socket: {
                        host: config.host || 'localhost',
                        port: config.port || 6379,
                        reconnectStrategy: config.retryStrategy || this.defaultRetryStrategy
                    },
                    password: config.password,
                    database: config.db || 0
                });
            }
            this.setupEventHandlers();
            await this.instance.connect();
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
        this.instance.on('end', () => {
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
