import { Request, Response } from 'express';
import { CacheService } from '@/utils/cache';

/**
 * Clear all cache
 */
export const clearAllCache = async (req: Request, res: Response) => {
    try {
        await CacheService.clearAll();
        res.status(200).json({
            success: true,
            message: 'All cache cleared successfully'
        });
    } catch (error) {
        console.error('Clear all cache error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cache',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Clear cache by pattern
 */
export const clearCacheByPattern = async (req: Request, res: Response) => {
    try {
        const { pattern } = req.params;
        if (!pattern) {
            return res.status(400).json({
                success: false,
                message: 'Pattern parameter is required'
            });
        }

        // Add 'api:' prefix if not present
        const fullPattern = pattern.startsWith('api:') ? pattern : `api:${pattern}`;

        await CacheService.clearPattern(fullPattern);
        res.status(200).json({
            success: true,
            message: `Cache cleared for pattern: ${fullPattern}`
        });
    } catch (error) {
        console.error('Clear cache by pattern error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cache by pattern',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (req: Request, res: Response) => {
    try {
        const stats = await CacheService.getStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get cache stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cache statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Clear specific cache key
 */
export const clearSpecificCache = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).json({
                success: false,
                message: 'Key parameter is required'
            });
        }

        // Add 'api:' prefix if not present
        const fullKey = key.startsWith('api:') ? key : `api:${key}`;

        await CacheService.del(fullKey);
        res.status(200).json({
            success: true,
            message: `Cache cleared for key: ${fullKey}`
        });
    } catch (error) {
        console.error('Clear specific cache error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear specific cache',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};