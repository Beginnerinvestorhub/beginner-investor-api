import { RedisService } from "../services/redis/redis.service";
import logger from "./logger";

type CacheOptions = {
  ttl?: number;
  tags?: string[];
  skipCache?: boolean;
};

type CacheKey = string | (string | number | boolean)[];

export class CacheOptimizer {
  private redisService: RedisService;
  private defaultTtl: number;
  private enabled: boolean;

  constructor(redisService: RedisService, defaultTtl: number = 300) {
    this.redisService = redisService;
    this.defaultTtl = defaultTtl;
    this.enabled = process.env.REDIS_ENABLED === "true";
  }

  public generateKey(parts: CacheKey): string {
    return Array.isArray(parts) ? parts.map(String).join(":") : String(parts);
  }

  public async withCache<T>(
    key: CacheKey,
    callback: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    if (!this.enabled || options.skipCache) return callback();

    const cacheKey = this.generateKey(key);

    try {
      const cached = await this.redisService.get<T>(cacheKey);
      if (cached !== null) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return cached;
      }

      logger.debug(`Cache miss: ${cacheKey}`);
      const result = await callback();
      const ttl = options.ttl ?? this.defaultTtl;

      await this.redisService.set(cacheKey, result, ttl);

      if (options.tags?.length) {
        await this.addToTagGroups(cacheKey, options.tags, ttl);
      }

      return result;
    } catch (error) {
      logger.error(`Cache error for key ${cacheKey}:`, error);
      return callback();
    }
  }

  public async invalidate(pattern: string | string[]): Promise<void> {
    if (!this.enabled) return;

    try {
      if (Array.isArray(pattern)) {
        await Promise.all(pattern.map((tag) => this.invalidateByTag(tag)));
      } else if (pattern.startsWith("tag:")) {
        await this.invalidateByTag(pattern.replace("tag:", ""));
      } else {
        await this.redisService.del(pattern);
      }
    } catch (error) {
      logger.error("Cache invalidation error:", error);
    }
  }

  private async addToTagGroups(
    key: string,
    tags: string[],
    ttl: number,
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      await Promise.all(
        tags.map(async (tag) => {
          const tagKey = `tag:${tag}`;
          await this.redisService.sAdd(tagKey, key);
          await this.redisService.expire(tagKey, ttl);
        }),
      );
    } catch (error) {
      logger.error("Failed to add to tag groups:", error);
    }
  }

  private async invalidateByTag(tag: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.redisService.sMembers(tagKey);

      if (keys.length > 0) {
        await this.redisService.del(...keys);
        await this.redisService.del(tagKey);
        logger.debug(`Invalidated ${keys.length} keys with tag: ${tag}`);
      }
    } catch (error) {
      logger.error(`Failed to invalidate tag ${tag}:`, error);
    }
  }

  public async clearAll(): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.redisService.flushDb();
      logger.warn("Cache cleared");
    } catch (error) {
      logger.error("Failed to clear cache:", error);
      throw error;
    }
  }

  public async getStats(): Promise<{
    enabled: boolean;
    keys: number;
    memory: Record<string, any>;
    info: Record<string, string>;
  }> {
    if (!this.enabled) {
      return { enabled: false, keys: 0, memory: {}, info: {} };
    }

    try {
      const [keys, memoryRaw, infoRaw] = await Promise.all([
        this.redisService.dbSize(),
        this.redisService.info("memory"),
        this.redisService.info("server"),
      ]);

      const parseInfo = (raw: string): Record<string, any> =>
        Object.fromEntries(
          raw
            .split("\r\n")
            .filter((line) => line && !line.startsWith("#"))
            .map((line) => {
              const [key, value] = line.split(":");
              return [
                key.trim(),
                isNaN(Number(value)) ? value.trim() : Number(value),
              ];
            }),
        );

      return {
        enabled: true,
        keys,
        memory: parseInfo(memoryRaw),
        info: parseInfo(infoRaw),
      };
    } catch (error) {
      logger.error("Failed to get cache stats:", error);
      throw error;
    }
  }
}

export const cacheOptimizer = new CacheOptimizer(RedisService.getInstance());
