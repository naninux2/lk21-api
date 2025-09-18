#!/usr/bin/env node

require('dotenv').config();
require('module-alias/register');

const { CacheService } = require('../dist/utils/cache');
const { connectRedis, disconnectRedis } = require('../dist/config/redis');

const commands = {
    'clear-all': async () => {
        console.log('🗑️  Clearing all cache...');
        await CacheService.clearAll();
        console.log('✅ Done!');
    },
    
    'clear-movies': async () => {
        console.log('🗑️  Clearing movie cache...');
        await CacheService.clearPattern('api:/movies*');
        await CacheService.clearPattern('api:/popular/movies*');
        await CacheService.clearPattern('api:/recent-release/movies*');
        await CacheService.clearPattern('api:/top-rated/movies*');
        console.log('✅ Movie cache cleared!');
    },
    
    'clear-series': async () => {
        console.log('🗑️  Clearing series cache...');
        await CacheService.clearPattern('api:/series*');
        await CacheService.clearPattern('api:/popular/series*');
        await CacheService.clearPattern('api:/recent-release/series*');
        await CacheService.clearPattern('api:/top-rated/series*');
        await CacheService.clearPattern('api:/episodes*');
        console.log('✅ Series cache cleared!');
    },
    
    'clear-search': async () => {
        console.log('🗑️  Clearing search cache...');
        await CacheService.clearPattern('api:/search*');
        console.log('✅ Search cache cleared!');
    },
    
    'stats': async () => {
        console.log('📊 Getting cache statistics...');
        const stats = await CacheService.getStats();
        console.log(`\n📈 Cache Statistics:`);
        console.log(`Total keys: ${stats.totalKeys}`);
        
        if (stats.keys.length > 0) {
            console.log('\n🔑 Cache keys:');
            stats.keys.forEach(key => console.log(`  - ${key}`));
        }
    },
    
    'help': () => {
        console.log(`
🔧 LK21 API Cache Management CLI

Usage: npm run cache <command>

Available commands:
  clear-all     Clear all cache entries
  clear-movies  Clear movie-related cache
  clear-series  Clear series-related cache  
  clear-search  Clear search cache
  stats         Show cache statistics
  help          Show this help message

Examples:
  npm run cache clear-all
  npm run cache stats
  npm run cache clear-movies
        `);
    }
};

async function main() {
    const command = process.argv[2];
    
    if (!command || !commands[command]) {
        commands.help();
        process.exit(1);
    }
    
    try {
        // Connect to Redis
        await connectRedis();
        
        // Execute command
        await commands[command]();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔍 Make sure Redis server is running: redis-server');
        process.exit(1);
    } finally {
        // Disconnect from Redis
        await disconnectRedis();
        process.exit(0);
    }
}

main().catch(console.error);