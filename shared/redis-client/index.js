"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisManager = void 0;
const redis_1 = require("redis");
class SharedRedisManager {
    constructor() {
        this.client = null;
        this.isConnectedFlag = false;
        this.initializeClient();
    }
    static getInstance() {
        if (!SharedRedisManager.instance) {
            SharedRedisManager.instance = new SharedRedisManager();
        }
        return SharedRedisManager.instance;
    }
    initializeClient() {
        // Get Redis URL from environment variables
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.client = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        console.error('Max Redis reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });
        this.setupEventListeners();
    }
    setupEventListeners() {
        if (!this.client)
            return;
        this.client.on('connect', () => {
            this.isConnectedFlag = true;
            console.log('Shared Redis client connected');
        });
        this.client.on('error', (err) => {
            console.error('Shared Redis client error:', err);
            this.isConnectedFlag = false;
        });
        this.client.on('reconnecting', () => {
            console.log('Reconnecting to shared Redis...');
        });
        this.client.on('end', () => {
            this.isConnectedFlag = false;
            console.log('Shared Redis client connection closed');
        });
    }
    getClient() {
        if (!this.client) {
            throw new Error('Redis client not initialized');
        }
        return this.client;
    }
    isConnected() {
        return this.isConnectedFlag;
    }
    async connect() {
        if (!this.client) {
            this.initializeClient();
        }
        if (!this.isConnectedFlag) {
            try {
                await this.client.connect();
            }
            catch (error) {
                console.error('Failed to connect to shared Redis:', error);
                throw error;
            }
        }
    }
    async disconnect() {
        if (this.client && this.isConnectedFlag) {
            try {
                await this.client.quit();
            }
            catch (error) {
                console.error('Error disconnecting from shared Redis:', error);
                throw error;
            }
        }
    }
}
// Export singleton instance
exports.redisManager = SharedRedisManager.getInstance();
// Initialize connection on module load
(async () => {
    try {
        await exports.redisManager.connect();
        console.log('Shared Redis manager initialized');
    }
    catch (error) {
        console.error('Failed to initialize shared Redis manager:', error);
    }
})();
