# LK21 API Endpoints Summary

## 📊 Total Endpoints: 21

### 🎬 Movies (7 endpoints)
| Method | Endpoint | Description | Cache | Playwright |
|--------|----------|-------------|-------|------------|
| GET | `/movies` | Latest movies | ✅ | ❌ |
| GET | `/popular/movies` | Popular movies | ✅ | ❌ |
| GET | `/recent-release/movies` | Recent release movies | ✅ | ❌ |
| GET | `/top-rated/movies` | Top-rated movies | ✅ | ❌ |
| GET | `/movies/{id}` | Movie details | ✅ | ❌ |
| GET | `/movies/{id}/streams` | Movie streaming sources | ✅ | ✅ |
| GET | `/movies/{id}/download` | Movie download links | ✅ | ❌ |

### 📺 Series (6 endpoints)  
| Method | Endpoint | Description | Cache | Playwright |
|--------|----------|-------------|-------|------------|
| GET | `/series` | Latest series | ✅ | ❌ |
| GET | `/popular/series` | Popular series | ✅ | ❌ |
| GET | `/recent-release/series` | Recent release series | ✅ | ❌ |
| GET | `/top-rated/series` | Top-rated series | ✅ | ❌ |
| GET | `/series/{id}` | Series details + seasons | ✅ | ✅ |
| GET | `/episodes/{id}` | Episode streaming sources | ✅ | ✅ |

### 🔍 Search (1 endpoint)
| Method | Endpoint | Description | Cache | Playwright |
|--------|----------|-------------|-------|------------|
| GET | `/search/{title}` | Search movies & series | ✅ | ❌ |

### 🏷️ Categories (6 endpoints)
| Method | Endpoint | Description | Cache | Playwright |
|--------|----------|-------------|-------|------------|
| GET | `/genres` | All available genres | ✅ | ❌ |
| GET | `/genres/{genre}` | Movies by genre | ✅ | ❌ |
| GET | `/countries` | All available countries | ✅ | ❌ |
| GET | `/countries/{country}` | Movies by country | ✅ | ❌ |
| GET | `/years` | All available years | ✅ | ❌ |
| GET | `/years/{year}` | Movies by year | ✅ | ❌ |

### 🗂️ Cache Management (4 endpoints)
| Method | Endpoint | Description | Cache | Playwright |
|--------|----------|-------------|-------|------------|
| DELETE | `/cache/clear` | Clear all cache | ❌ | ❌ |
| DELETE | `/cache/clear/{pattern}` | Clear cache by pattern | ❌ | ❌ |
| DELETE | `/cache/key/{key}` | Clear specific cache key | ❌ | ❌ |
| GET | `/cache/stats` | Cache statistics | ❌ | ❌ |

### ⚙️ System (1 endpoint)
| Method | Endpoint | Description | Cache | Playwright |
|--------|----------|-------------|-------|------------|
| GET | `/` | API information | ❌ | ❌ |

## 🔥 Performance Critical Endpoints (Heavy Operations)

### Playwright-Powered Endpoints (3 total)
These endpoints use browser automation and benefit most from caching:

1. **`GET /movies/{id}/streams`** - Movie streaming sources
2. **`GET /series/{id}`** - Series details with seasons/episodes  
3. **`GET /episodes/{id}`** - Episode streaming sources

> ⚡ **Cache TTL**: 30 seconds (configurable via `CACHE_TTL` env var)

## 📖 Documentation Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /docs` | Interactive Swagger UI |
| `GET /docs.json` | OpenAPI 3.0 JSON specification |

## 🎯 Usage Patterns

### High Traffic Endpoints
- `/movies` - Most frequently accessed
- `/popular/movies` - User favorites
- `/search/{title}` - Search functionality

### Resource Intensive Endpoints  
- `/series/{id}` - Requires season/episode scraping
- `/episodes/{id}` - Video source extraction
- `/movies/{id}/streams` - Stream URL generation

### Utility Endpoints
- `/cache/*` - Administrative operations
- `/genres`, `/countries`, `/years` - Metadata endpoints

## 🔧 Testing & Development

### Quick Tests
```bash
# Test popular endpoint
curl http://localhost:8080/popular/movies

# Test search
curl http://localhost:8080/search/avatar

# Check cache stats  
curl http://localhost:8080/cache/stats
```

### Documentation Testing
```bash
# Build and start server
npm run build && npm start

# Access interactive docs
open http://localhost:8080/docs
```

---

**Total Coverage**: ✅ 21 endpoints fully documented with Swagger UI