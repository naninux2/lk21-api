# Database Setup Guide

This project now includes PostgreSQL database integration with Drizzle ORM for persistent storage of movies, series, and related data.

## Database Schema

The database includes the following tables:
- **genres**: Movie/series genres with slugs
- **countries**: Production countries with slugs  
- **years**: Release years
- **movies**: Movie data with external IDs from scraping
- **series**: Series data with external IDs from scraping
- **seasons**: Series seasons linked to series
- **episodes**: Season episodes with streaming URLs
- **Junction tables**: For many-to-many relationships (genres, countries, directors, casts, etc.)

## Setup Instructions

### 1. Database Requirements
- PostgreSQL 12+ installed and running
- Database user with create database permissions

### 2. Environment Configuration
Add the following variables to your `.env` file:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lk21_api
```

### 3. Database Setup Commands

```bash
# Install dependencies (already done)
bun install

# Generate migration files (already done)
bun run db:generate

# Create database (manual step - create 'lk21_api' database in PostgreSQL)
# Run this in PostgreSQL:
# CREATE DATABASE lk21_api;

# Run migrations to create tables
bun run db:migrate

# Optional: Setup everything in one command
bun run db:setup
```

### 4. Database Studio (Optional)
View and manage your database with Drizzle Studio:

```bash
bun run db:studio
```

## How It Works

### Data Flow
1. **API calls**: When users access movie/series endpoints, data is scraped as usual
2. **Background saving**: Scraped data is automatically saved to PostgreSQL in the background
3. **Response**: API returns scraped data immediately (no waiting for database operations)
4. **Persistence**: All movie/series data is stored with relationships (genres, countries, directors, casts, etc.)

### Database Services
- **CategoryService**: Manages genres, countries, and years
- **MovieService**: Handles movie creation, updates, and relationships
- **SeriesService**: Manages series, seasons, episodes, and relationships

### Key Features
- **Upsert logic**: Updates existing records or creates new ones based on external IDs
- **Relationship management**: Automatically creates and links genres, countries, directors, casts
- **Background processing**: Database operations don't block API responses
- **Data integrity**: Foreign key constraints and unique indexes prevent duplicates

### Updated Controllers
All movie and series controllers now save data to the database:
- `/movies` → saves latest movies
- `/popular/movies` → saves popular movies  
- `/movies/{id}` → saves detailed movie info
- `/series` → saves latest series
- `/series/{id}` → saves detailed series with seasons/episodes

The API continues to return the same JSON responses while building a persistent database in the background.

## Migration Management

### Generate New Migrations
When you modify the schema files:

```bash
bun run db:generate
```

### Apply Migrations
```bash
bun run db:migrate
```

### Schema Files Location
- `src/db/schema/` - Database table definitions
- `drizzle/` - Generated migration files
- `drizzle.config.ts` - Drizzle configuration

## Database Access

You can query the database directly using the Drizzle ORM:

```typescript
import { db } from '@/db';
import { movies, series } from '@/db/schema';

// Get all movies
const allMovies = await db.select().from(movies);

// Get movie with relationships
const movieWithDetails = await MovieService.getMovieByExternalId('movie-slug');
```

This setup provides both real-time scraping and persistent data storage, allowing for features like:
- Caching scraped data
- Building recommendation systems
- Analytics and reporting  
- Data export capabilities
- Search functionality across stored data