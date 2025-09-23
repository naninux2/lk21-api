import { Router, IRouter } from 'express';
import { streamSeries, streamMovie } from '@/controllers/stream';
import { moviesByGenre, setOfGenres } from '@/controllers/genre';
import { moviesByYear, setOfYears } from '@/controllers/year';
import { searchedMoviesOrSeries } from '@/controllers/search';
import { moviesByCountry, setOfCountries } from '@/controllers/country';
import { CacheService } from '@/utils/cache';
import {
    clearAllCache,
    clearCacheByPattern,
    getCacheStats,
    clearSpecificCache
} from '@/controllers/cache';

import {
    latestMovies,
    movieDetails,
    popularMovies,
    recentReleaseMovies,
    topRatedMovies,
} from '../controllers/movie';

import {
    latestSeries,
    popularSeries,
    recentReleaseSeries,
    seriesDetails,
    topRatedSeries,
} from '../controllers/series';

import { downloadMovie, downloadSeries } from '@/controllers/download';

const router: IRouter = Router();

// Apply caching middleware to all routes
const cache = CacheService.middleware();

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get latest movies
 *     description: Retrieve the most recent movies from LK21
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of latest movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Movie routes with caching
router.get('/movies', cache, latestMovies);

/**
 * @swagger
 * /popular/movies:
 *   get:
 *     summary: Get popular movies
 *     description: Retrieve the most popular movies from LK21
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of popular movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/popular/movies', cache, popularMovies);

/**
 * @swagger
 * /recent-release/movies:
 *   get:
 *     summary: Get recent release movies
 *     description: Retrieve recently released movies from LK21
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of recent release movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/recent-release/movies', cache, recentReleaseMovies);

/**
 * @swagger
 * /top-rated/movies:
 *   get:
 *     summary: Get top-rated movies
 *     description: Retrieve the highest-rated movies from LK21
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of top-rated movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/top-rated/movies', cache, topRatedMovies);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie details
 *     description: Retrieve detailed information about a specific movie
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieDetails'
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/movies/:id', cache, movieDetails);

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Get all genres
 *     description: Retrieve all available movie/series genres
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 */
// Genre, country, year routes with caching
router.get('/genres', cache, setOfGenres);

/**
 * @swagger
 * /genres/{genre}:
 *   get:
 *     summary: Get movies by genre
 *     description: Retrieve movies from a specific genre
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre name (e.g., action, comedy, horror)
 *         example: action
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of movies in the specified genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/genres/:genre', cache, moviesByGenre);

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all countries
 *     description: Retrieve all available movie/series countries
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 */
router.get('/countries', cache, setOfCountries);

/**
 * @swagger
 * /countries/{country}:
 *   get:
 *     summary: Get movies by country
 *     description: Retrieve movies from a specific country
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name (e.g., usa, korea, japan)
 *         example: usa
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of movies from the specified country
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/countries/:country', cache, moviesByCountry);

/**
 * @swagger
 * /years:
 *   get:
 *     summary: Get all years
 *     description: Retrieve all available movie/series release years
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Year'
 */
router.get('/years', cache, setOfYears);

/**
 * @swagger
 * /years/{year}:
 *   get:
 *     summary: Get movies by year
 *     description: Retrieve movies from a specific release year
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Release year (e.g., 2023, 2022, 2021)
 *         example: "2023"
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of movies from the specified year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/years/:year', cache, moviesByYear);

/**
 * @swagger
 * /series:
 *   get:
 *     summary: Get latest series
 *     description: Retrieve the most recent TV series from LK21
 *     tags: [Series]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of latest series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Series'
 */
// Series routes with caching
router.get('/series', cache, latestSeries);

/**
 * @swagger
 * /popular/series:
 *   get:
 *     summary: Get popular series
 *     description: Retrieve the most popular TV series from LK21
 *     tags: [Series]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of popular series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Series'
 */
router.get('/popular/series', cache, popularSeries);

/**
 * @swagger
 * /recent-release/series:
 *   get:
 *     summary: Get recent release series
 *     description: Retrieve recently released TV series from LK21
 *     tags: [Series]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of recent release series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Series'
 */
router.get('/recent-release/series', cache, recentReleaseSeries);

/**
 * @swagger
 * /top-rated/series:
 *   get:
 *     summary: Get top-rated series
 *     description: Retrieve the highest-rated TV series from LK21
 *     tags: [Series]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: List of top-rated series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Series'
 */
router.get('/top-rated/series', cache, topRatedSeries);

/**
 * @swagger
 * /series/{id}:
 *   get:
 *     summary: Get series details
 *     description: Retrieve detailed information about a specific TV series including seasons and episodes
 *     tags: [Series]
 *     parameters:
 *       - $ref: '#/components/parameters/SeriesId'
 *     responses:
 *       200:
 *         description: Series details with seasons and episodes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeriesDetails'
 *       404:
 *         description: Series not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/series/:id', cache, seriesDetails);

/**
 * @swagger
 * /episodes/{id}:
 *   get:
 *     summary: Get episode streaming sources
 *     description: Retrieve streaming sources and details for a specific episode
 *     tags: [Streaming]
 *     parameters:
 *       - $ref: '#/components/parameters/EpisodeId'
 *     responses:
 *       200:
 *         description: Episode streaming sources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: Episode title
 *                       example: "Wednesday - Episode 1"
 *                     episode:
 *                       type: string
 *                       description: Episode number
 *                       example: "Episode 1"
 *                     streaming_url:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           provider:
 *                             type: string
 *                             description: Streaming provider name
 *                             example: "Server 1"
 *                           url:
 *                             type: string
 *                             format: uri
 *                             description: Streaming URL
 *                             example: "https://example.com/stream/episode1"
 *                       description: Available streaming sources
 *                     download_url:
 *                       type: string
 *                       format: uri
 *                       description: Download URL if available
 *                       example: "https://example.com/download/episode1"
 *       404:
 *         description: Episode not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/episodes/:id', cache, streamSeries);

/**
 * @swagger
 * /search/{title}:
 *   get:
 *     summary: Search movies and series
 *     description: Search for movies and TV series by title
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (movie or series title)
 *         example: "avatar"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Movie'
 *                   - $ref: '#/components/schemas/Series'
 */
// Search with caching
router.get('/search/:title', cache, searchedMoviesOrSeries);

/**
 * @swagger
 * /cache/clear:
 *   delete:
 *     summary: Clear all cache
 *     description: Delete all cached data from Redis
 *     tags: [Cache Management]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Failed to clear cache
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Cache management endpoints (no caching for these)
router.delete('/cache/clear', clearAllCache);

/**
 * @swagger
 * /cache/clear/{pattern}:
 *   delete:
 *     summary: Clear cache by pattern
 *     description: Delete cached data matching a specific pattern
 *     tags: [Cache Management]
 *     parameters:
 *       - in: path
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache pattern to match (e.g., movies*, series*, search*)
 *         example: "movies*"
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid pattern
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/cache/clear/:pattern', clearCacheByPattern);

/**
 * @swagger
 * /cache/key/{key}:
 *   delete:
 *     summary: Clear specific cache key
 *     description: Delete a specific cache entry by key
 *     tags: [Cache Management]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Specific cache key to delete
 *         example: "/movies"
 *     responses:
 *       200:
 *         description: Cache key cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/cache/key/:key', clearSpecificCache);

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Retrieve information about current cache usage
 *     tags: [Cache Management]
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheStats'
 *       500:
 *         description: Failed to get cache stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/cache/stats', getCacheStats);

export default router;
