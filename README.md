# LK21 API

![cover-banner](docs/img/cover-banner.jpg)

Unofficial LK21 (LayarKaca21) and NontonDrama APIs for streaming movies, animations, and series with Indonesian subtitles. LK21 API is perfect for improving your coding skills or just having fun exploring movies from around the world. Best of all, you can enjoy this API without any financial commitment!

## Table of Contents

-   [Getting Started](#getting-started)
    -   [Installation](#installation)
    -   [Environment Variables](#environment-variables)
    -   [Redis Caching](#redis-caching)
-   [API Documentation](#api-documentation)
-   [Reference](#reference)
    -   [List of Endpoints](#list-of-endpoints)
    -   [Pagination](#pagination)
-   [FAQ](#faq)
-   [Showcase](#showcase)
-   [License](#license)
-   [Disclamer](#disclamer)

## Getting Started

### Installation

**Step 1:** Clone this repository.


**Step 2:** Rename the `.env.example` file to `.env` and complete the required [environment variables](#environment-variables).

**Step 3:** Install dependencies.

```bash
npm install
```

**Step 4:** Enable Git hooks and compile the TypeScript code.

```bash
npm run prepare && npm run build
```

**Step 5:** *(Optional)* Set up Redis for caching.

```bash
# Install and start Redis server
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

**Step 6:** Run the project.

```bash
npm start
```

### Environment Variables

The target URLs have the potential to change at any time because their servers are extremely vulnerable to being blocked. Therefore, I declared the target URLs in the Node environment variables.

```bash
# LK21 (LayarKaca21) URL
LK21_URL = https://tv.lk21official.live

# NontonDrama URL
ND_URL = https://tv.nontondrama.lol

# Redis configuration (optional)
REDIS_URL = redis://localhost:6379
CACHE_TTL = 30
```

### Redis Caching

This API includes Redis caching to improve performance and reduce load on scraped websites. Caching is especially beneficial for:

- **Heavy Playwright operations** (series details, episode streaming)
- **Movie listings and search results**
- **Genre, country, and year data**

**Benefits:**
- 🚀 **Faster response times** - Cached responses served instantly
- 🔄 **Reduced scraping load** - Less requests to target websites  
- 🎭 **Browser overhead reduction** - Playwright operations cached
- 📊 **Configurable TTL** - Set cache duration via `CACHE_TTL` (default: 30 seconds)

**Setup:**
1. Install Redis: `brew install redis` (macOS) or [download for Windows](https://github.com/tporadowski/redis/releases)
2. Start Redis: `redis-server`
3. The API will automatically use caching when Redis is available

**Note:** The API works perfectly fine without Redis - it just won't have caching benefits.

## API Documentation

LK21 API provides comprehensive **interactive documentation** powered by Swagger UI.

### 📖 Access Documentation

**Swagger UI (Interactive)**: `http://localhost:8080/docs`
- Interactive API testing interface
- Try endpoints directly from browser  
- Detailed request/response schemas
- Real-time API responses

**OpenAPI JSON**: `http://localhost:8080/docs.json`
- Raw OpenAPI 3.0 specification
- Import to Postman, Insomnia, or other tools

### 🎯 Features

- **Categorized endpoints** (Movies, Series, Search, Cache Management)
- **Interactive testing** with "Try it out" buttons
- **Comprehensive schemas** with examples
- **Real-time response** monitoring
- **Mobile-friendly** interface
- **Parameter validation** and error handling

### 📱 Quick Start
1. Start the server: `npm start`
2. Open documentation: `http://localhost:8080/docs`
3. Click **"Try it out"** on any endpoint
4. Test the API directly in your browser!

See detailed documentation guide: [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Reference

### List of Endpoints

| Request                            | Response                  | Pagination |
| :--------------------------------- | :------------------------ | :--------: |
| `GET /movies`                      | Recent upload movies      |     √      |
| `GET /movies/{movieId}`            | The movie details         |     -      |
| `GET /popular/movies`              | Popular movies            |     √      |
|                                    |                           |            |
| `GET /series`                      | Recent upload series      |     √      |
| `GET /series/{seriesId}`           | The series details        |     -      |
| `GET /popular/series`              | Popular series            |     √      |
|                                    |                           |            |
| `GET /search/{movieOrSeriesTitle}` | Searched movies or series |     -      |
|                                    |                           |            |
| `GET /genres`                      | A set of genres           |     -      |
| `GET /countries`                   | A set of countries        |     -      |
| `GET /years`                       | A set of years            |     -      |

See more LK21 API [endpoints](/docs/endpoints.md).

### Pagination

Some endpoints support a way of paging the dataset, taking a `page` as query parameters:

```bash
GET /popular/movies?page=5
```

## FAQ

<details>
  <summary><strong>What is LK21?</strong></summary>

LK21 (LayarKaca21) is a large-scale Indonesian streaming service that offers you to watch movies, animations, and series with Indonesian subtitles. This is a popular #1 streaming service in Indonesia because LK21 serves thousands of movies from around the world such as the US, Japan, Korea, and more for free.

</details>

<details>
  <summary><strong>Is this the Official LK21 API?</strong></summary>

NO, it's unofficial LK21 API, I fetch their movies by web scraping with Node.js, [@axios](https://www.npmjs.com/package/axios), and [@cheerio](https://www.npmjs.com/package/cheerio).

</details>

<details>
  <summary><strong>What is NontonDrama?</strong></summary>

NontonDrama is another source used by LK21 to serve movie series with updated episodes.

</details>

<details>
  <summary><strong>Streaming URLs is blocked and not working</strong></summary>

To display the movie streaming sources in the `<iframe>` you need to run your application on HTTPS. For security reasons, LK21 prohibits loading of the resources in the `<iframe>` outside of their domain.

</details>

## Showcase

> Feel free to showcase your projects here by creating a pull request.

List of projects using LK21 API:

-   ?

## License

Distributed under the [MIT License](/LICENSE).

## Disclamer

The movies contained in this API are obtained from the original LK21 and NontonDrama websites by web scraping. Developers using this API must follow the applicable regulations by mentioning this project or the official owner in their projects and are prohibited from abusing this API for personal benefits.

[(Back to Top)](#lk21-api)
