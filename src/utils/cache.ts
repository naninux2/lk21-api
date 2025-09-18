import { redisClient } from '@/config/redis';

export class CacheService {
    private static getTTL(): number {
        return parseInt(process.env.CACHE_TTL || '30', 10);
    }

    /**
     * Get cached data
     * @param key Cache key
     * @returns Parsed JSON data or null if not found
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            if (!redisClient.isOpen) {
                return null;
            }
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set cached data with TTL
     * @param key Cache key
     * @param data Data to cache
     * @param customTTL Optional custom TTL in seconds
     */
    static async set(key: string, data: any, customTTL?: number): Promise<void> {
        try {
            if (!redisClient.isOpen) {
                return;
            }
            const ttl = customTTL || this.getTTL();
            await redisClient.setEx(key, ttl, JSON.stringify(data));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Delete cached data
     * @param key Cache key
     */
    static async del(key: string): Promise<void> {
        try {
            if (!redisClient.isOpen) {
                return;
            }
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    /**
     * Clear all API cache (keys starting with 'api:')
     */
    static async clearAll(): Promise<void> {
        try {
            if (!redisClient.isOpen) {
                return;
            }
            const keys = await redisClient.keys('api:*');
            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`🗑️  Cleared ${keys.length} cache entries`);
            } else {
                console.log('📭 No cache entries to clear');
            }
        } catch (error) {
            console.error('Cache clear all error:', error);
        }
    }

    /**
     * Clear cache by pattern
     * @param pattern Pattern to match (e.g., 'api:/movies*', 'api:/series*')
     */
    static async clearPattern(pattern: string): Promise<void> {
        try {
            if (!redisClient.isOpen) {
                return;
            }
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`🗑️  Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
            } else {
                console.log(`📭 No cache entries found for pattern: ${pattern}`);
            }
        } catch (error) {
            console.error('Cache clear pattern error:', error);
        }
    }

    /**
     * Get all cache keys
     */
    static async getKeys(): Promise<string[]> {
        try {
            if (!redisClient.isOpen) {
                return [];
            }
            return await redisClient.keys('api:*');
        } catch (error) {
            console.error('Cache get keys error:', error);
            return [];
        }
    }

    /**
     * Get cache statistics
     */
    static async getStats(): Promise<{ totalKeys: number; keys: string[] }> {
        try {
            const keys = await this.getKeys();
            return {
                totalKeys: keys.length,
                keys
            };
        } catch (error) {
            console.error('Cache stats error:', error);
            return { totalKeys: 0, keys: [] };
        }
    }

    /**
     * Generate cache key from request
     * @param req Express request object
     * @returns Cache key string
     */
    static generateKey(req: any): string {
        const { originalUrl, query } = req;
        const queryString = Object.keys(query).length ?
            Object.keys(query)
                .sort()
                .map(key => `${key}=${query[key]}`)
                .join('&') : '';
        return `api:${originalUrl}${queryString ? `?${queryString}` : ''}`;
    }

    /**
     * Cache middleware for Express routes
     */
    static middleware() {
        return async (req: any, res: any, next: any) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            const cacheKey = this.generateKey(req);
            const cachedData = await this.get(cacheKey);

            if (cachedData) {
                console.log(`Cache hit for key: ${cacheKey}`);
                return res.json(cachedData);
            }

            // Store original json method
            const originalJson = res.json;

            // Override json method to cache the response
            res.json = function (data: any) {
                // Cache the response data
                CacheService.set(cacheKey, data).catch(err =>
                    console.error('Failed to cache response:', err)
                );
                console.log(`Cache set for key: ${cacheKey}`);

                // Call original json method
                return originalJson.call(this, data);
            };

            next();
        };
    }
}