# Redis Integration

This project now includes Redis caching to improve performance and reduce load on the scraped websites.

## Features

- **Automatic caching**: All GET endpoints are automatically cached
- **Configurable TTL**: Cache time-to-live can be set via environment variables
- **Playwright optimization**: Heavy operations using Playwright are cached to reduce browser overhead
- **Graceful fallback**: If Redis is unavailable, the API continues to work normally

## Setup

1. **Install Redis** on your system:
   - **Windows**: Download and install Redis from [Redis Windows releases](https://github.com/tporadowski/redis/releases)
   - **macOS**: `brew install redis`
   - **Ubuntu/Debian**: `sudo apt install redis-server`
   - **Docker**: `docker run -d -p 6379:6379 redis:alpine`

2. **Start Redis server**:
   ```bash
   redis-server
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and set:
   ```env
   REDIS_URL=redis://localhost:6379
   CACHE_TTL=30
   ```

## Configuration

- `REDIS_URL`: Redis connection string (default: `redis://localhost:6379`)
- `CACHE_TTL`: Cache duration in seconds (default: `30`)

## How it works

1. **Cache Key Generation**: Each request generates a unique cache key based on the URL and query parameters
2. **Cache Hit**: If data exists in cache, it's returned immediately
3. **Cache Miss**: If no cache exists, the request is processed normally and the result is cached
4. **TTL Expiration**: Cached data expires after the configured time

## Performance Benefits

- **Reduced scraping load**: Repeated requests don't trigger new scraping operations
- **Faster response times**: Cached responses are served instantly
- **Browser overhead reduction**: Playwright operations are cached, reducing browser launching overhead
- **Bandwidth savings**: Less requests to target websites

## Monitoring

The application logs cache hits and misses for debugging:
- `Cache hit for key: api:/movies` - Data served from cache
- `Cache set for key: api:/movies` - Data stored in cache

## Cache Management

The cache automatically expires based on the TTL setting. For manual cache management, you have several options:

### 1. Using API Endpoints

```bash
# Clear all cache
curl -X DELETE http://localhost:8080/cache/clear

# Clear specific pattern (e.g., all movie cache)
curl -X DELETE http://localhost:8080/cache/clear/movies*

# Clear specific key
curl -X DELETE http://localhost:8080/cache/key/movies

# Get cache statistics
curl http://localhost:8080/cache/stats
```

### 2. Using CLI Commands

```bash
# Clear all cache
npm run cache clear-all

# Clear movie-related cache only
npm run cache clear-movies

# Clear series-related cache only
npm run cache clear-series

# Clear search cache only
npm run cache clear-search

# Show cache statistics
npm run cache stats

# Show help
npm run cache help
```

### 3. Using Redis CLI Directly

```bash
# Clear all API cache
redis-cli DEL $(redis-cli KEYS "api:*")

# View all cache keys
redis-cli KEYS "api:*"

# Check specific key
redis-cli GET "api:/movies"

# Clear everything (all Redis data)
redis-cli FLUSHALL
```

### 4. Programmatically

```typescript
import { CacheService } from '@/utils/cache';

// Clear all cache
await CacheService.clearAll();

// Clear specific pattern
await CacheService.clearPattern('api:/movies*');

// Clear specific key
await CacheService.del('api:/movies');

// Get cache statistics
const stats = await CacheService.getStats();
```