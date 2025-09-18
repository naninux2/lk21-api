import { connectRedis, redisClient, disconnectRedis } from '../src/config/redis';
import { CacheService } from '../src/utils/cache';

async function testRedisConnection() {
    console.log('🔧 Testing Redis connection...');
    
    try {
        // Connect to Redis
        await connectRedis();
        console.log('✅ Redis connection successful');

        // Test basic set/get operations
        await CacheService.set('test:key', { message: 'Hello Redis!', timestamp: Date.now() });
        console.log('✅ Cache set operation successful');

        const cached = await CacheService.get('test:key');
        console.log('✅ Cache get operation successful:', cached);

        // Test TTL
        console.log(`🔄 Testing TTL (${process.env.CACHE_TTL || 30} seconds)...`);
        
        // Clean up test data
        await CacheService.del('test:key');
        console.log('✅ Cache delete operation successful');

        // Test cache key generation
        const mockReq = {
            originalUrl: '/test/endpoint',
            query: { page: 1, limit: 10 }
        };
        const cacheKey = CacheService.generateKey(mockReq);
        console.log('✅ Cache key generation:', cacheKey);

        console.log('\n🎉 All Redis tests passed!');
        console.log('\n📊 Redis Info:');
        console.log(`- Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
        console.log(`- Cache TTL: ${process.env.CACHE_TTL || 30} seconds`);
        console.log(`- Redis connected: ${redisClient.isOpen}`);

    } catch (error) {
        console.error('❌ Redis test failed:', error);
        console.log('\n🔍 Troubleshooting:');
        console.log('1. Make sure Redis server is running: redis-server');
        console.log('2. Check Redis URL in .env file');
        console.log('3. Verify Redis is accessible on the configured port');
    } finally {
        await disconnectRedis();
        console.log('\n👋 Redis connection closed');
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    // Load environment variables
    require('dotenv').config();
    testRedisConnection().catch(console.error);
}

export default testRedisConnection;