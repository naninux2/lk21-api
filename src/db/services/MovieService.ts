import { db } from '../index';
import {
    movies,
    movieGenres,
    movieCountries,
    movieDirectors,
    movieCasts,
    movieStreamingUrls,
    genres,
    countries
} from '../schema';
import { eq } from 'drizzle-orm';
import { IMovieDetails, IMovies, DbMovieWithRelations } from '@/types';
import { CategoryService } from './CategoryService';

export class MovieService {

    // Environment flag to disable database operations temporarily
    private static get isDbEnabled(): boolean {
        return process.env.ENABLE_DATABASE_OPERATIONS === 'true';
    }

    static async createOrUpdateMovie(movieData: IMovieDetails | IMovies): Promise<number | null> {
        // Database operations disabled temporarily
        if (!this.isDbEnabled) {
            console.log(`[DB_DISABLED] Skipping database save for movie: ${movieData.title}`);
            return Math.floor(Math.random() * 1000); // Return mock ID
        }

        try {
            const isDetails = 'synopsis' in movieData;

            // Insert or update movie
            const [movie] = await db
                .insert(movies)
                .values({
                    externalId: movieData._id,
                    title: movieData.title,
                    type: movieData.type,
                    posterImg: movieData.posterImg,
                    rating: movieData.rating,
                    url: 'url' in movieData ? movieData.url : undefined,
                    qualityResolution: 'qualityResolution' in movieData ? movieData.qualityResolution : undefined,
                    quality: isDetails ? (movieData as IMovieDetails).quality : undefined,
                    duration: movieData.duration,
                    year: movieData.year,
                    releaseDate: isDetails ? (movieData as IMovieDetails).releaseDate : undefined,
                    synopsis: isDetails ? (movieData as IMovieDetails).synopsis : undefined,
                    trailerUrl: isDetails ? (movieData as IMovieDetails).trailerUrl : undefined,
                    downloadUrl: isDetails ? (movieData as IMovieDetails).download_url : undefined,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: movies.externalId,
                    set: {
                        title: movieData.title,
                        posterImg: movieData.posterImg,
                        rating: movieData.rating,
                        qualityResolution: 'qualityResolution' in movieData ? movieData.qualityResolution : undefined,
                        duration: movieData.duration,
                        year: movieData.year,
                        ...(isDetails && {
                            quality: (movieData as IMovieDetails).quality,
                            releaseDate: (movieData as IMovieDetails).releaseDate,
                            synopsis: (movieData as IMovieDetails).synopsis,
                            trailerUrl: (movieData as IMovieDetails).trailerUrl,
                            downloadUrl: (movieData as IMovieDetails).download_url,
                        }),
                        updatedAt: new Date(),
                    }
                })
                .returning();

            if (!movie) return null;

            // Handle genres
            if (movieData.genres && movieData.genres.length > 0) {
                await this.updateMovieGenres(movie.id, movieData.genres);
            }

            // Handle countries (only for detailed movies)
            if (isDetails && (movieData as IMovieDetails).countries) {
                await this.updateMovieCountries(movie.id, (movieData as IMovieDetails).countries);
            }

            // Handle directors (only for detailed movies)
            if (isDetails && (movieData as IMovieDetails).directors) {
                await this.updateMovieDirectors(movie.id, (movieData as IMovieDetails).directors);
            }

            // Handle casts (only for detailed movies)
            if (isDetails && (movieData as IMovieDetails).casts) {
                await this.updateMovieCasts(movie.id, (movieData as IMovieDetails).casts);
            }

            // Handle streaming URLs (only for detailed movies)
            if (isDetails && (movieData as IMovieDetails).streaming_url) {
                await this.updateMovieStreamingUrls(movie.id, (movieData as IMovieDetails).streaming_url);
            }

            return movie.id;
        } catch (error) {
            // Handle specific database constraint violations
            if (error && typeof error === 'object' && 'code' in error) {
                const dbError = error as any;

                // Handle duplicate key violations
                if (dbError.code === '23505') {
                    if (dbError.constraint === 'movies_title_idx') {
                        console.warn(`Movie with title "${movieData.title}" already exists, skipping...`);
                        // Try to find existing movie by title and year for potential update
                        try {
                            const existingMovies = await db
                                .select({ id: movies.id })
                                .from(movies)
                                .where(eq(movies.title, movieData.title));

                            if (existingMovies.length > 0) {
                                console.log(`Found existing movie with same title, using existing ID: ${existingMovies[0].id}`);
                                return existingMovies[0].id;
                            }
                        } catch (findError) {
                            console.error('Error finding existing movie by title:', findError);
                        }
                        return null;
                    }

                    if (dbError.constraint === 'movies_external_id_idx') {
                        console.warn(`Movie with external_id "${movieData._id}" already exists`);
                        return null;
                    }
                }
            }

            console.error('Error creating/updating movie:', error);
            return null;
        }
    }

    private static async updateMovieGenres(movieId: number, genreData: { name: string; url: string }[]) {
        try {
            // Delete existing genres
            await db.delete(movieGenres).where(eq(movieGenres.movieId, movieId));

            // Create new genre associations
            for (const genreItem of genreData) {
                const slug = CategoryService.createSlug(genreItem.name);
                const genre = await CategoryService.createGenre(genreItem.name, slug);

                if (genre) {
                    await db.insert(movieGenres).values({
                        movieId: movieId,
                        genreId: genre.id
                    });
                }
            }
        } catch (error) {
            console.error('Error updating movie genres:', error);
        }
    }

    private static async updateMovieCountries(movieId: number, countryData: { name: string; url: string }[]) {
        try {
            // Delete existing countries
            await db.delete(movieCountries).where(eq(movieCountries.movieId, movieId));

            // Create new country associations
            for (const countryItem of countryData) {
                const slug = CategoryService.createSlug(countryItem.name);
                const country = await CategoryService.createCountry(countryItem.name, slug);

                if (country) {
                    await db.insert(movieCountries).values({
                        movieId: movieId,
                        countryId: country.id
                    });
                }
            }
        } catch (error) {
            console.error('Error updating movie countries:', error);
        }
    }

    private static async updateMovieDirectors(movieId: number, directorData: { name: string; url: string }[]) {
        try {
            // Delete existing directors
            await db.delete(movieDirectors).where(eq(movieDirectors.movieId, movieId));

            // Create new directors
            const directorsToInsert = directorData.map(director => ({
                movieId: movieId,
                name: director.name,
                url: director.url
            }));

            if (directorsToInsert.length > 0) {
                await db.insert(movieDirectors).values(directorsToInsert);
            }
        } catch (error) {
            console.error('Error updating movie directors:', error);
        }
    }

    private static async updateMovieCasts(movieId: number, castData: { name: string; url: string }[]) {
        try {
            // Delete existing casts
            await db.delete(movieCasts).where(eq(movieCasts.movieId, movieId));

            // Create new casts
            const castsToInsert = castData.map(cast => ({
                movieId: movieId,
                name: cast.name,
                url: cast.url
            }));

            if (castsToInsert.length > 0) {
                await db.insert(movieCasts).values(castsToInsert);
            }
        } catch (error) {
            console.error('Error updating movie casts:', error);
        }
    }

    private static async updateMovieStreamingUrls(movieId: number, streamingData: { provider: string; url: string }[]) {
        try {
            // Delete existing streaming URLs
            await db.delete(movieStreamingUrls).where(eq(movieStreamingUrls.movieId, movieId));

            // Create new streaming URLs
            const streamingUrlsToInsert = streamingData.map(stream => ({
                movieId: movieId,
                provider: stream.provider,
                url: stream.url
            }));

            if (streamingUrlsToInsert.length > 0) {
                await db.insert(movieStreamingUrls).values(streamingUrlsToInsert);
            }
        } catch (error) {
            console.error('Error updating movie streaming URLs:', error);
        }
    }

    static async getMovieByExternalId(externalId: string): Promise<DbMovieWithRelations | null> {
        // Database operations disabled temporarily
        if (!this.isDbEnabled) {
            console.log(`[DB_DISABLED] Skipping database lookup for external ID: ${externalId}`);
            return null; // Always return null to force fresh scraping
        }

        try {
            const result = await db
                .select({
                    id: movies.id,
                    externalId: movies.externalId,
                    title: movies.title,
                    type: movies.type,
                    posterImg: movies.posterImg,
                    rating: movies.rating,
                    url: movies.url,
                    qualityResolution: movies.qualityResolution,
                    quality: movies.quality,
                    duration: movies.duration,
                    year: movies.year,
                    releaseDate: movies.releaseDate,
                    synopsis: movies.synopsis,
                    trailerUrl: movies.trailerUrl,
                    downloadUrl: movies.downloadUrl,
                })
                .from(movies)
                .where(eq(movies.externalId, externalId))
                .limit(1);

            if (!result || result.length === 0) return null;

            const movie = result[0];

            // Get related data
            const movieGenresResult = await db
                .select({
                    id: genres.id,
                    name: genres.name,
                    slug: genres.slug,
                })
                .from(movieGenres)
                .innerJoin(genres, eq(movieGenres.genreId, genres.id))
                .where(eq(movieGenres.movieId, movie.id));

            const movieCountriesResult = await db
                .select({
                    id: countries.id,
                    name: countries.name,
                    slug: countries.slug,
                })
                .from(movieCountries)
                .innerJoin(countries, eq(movieCountries.countryId, countries.id))
                .where(eq(movieCountries.movieId, movie.id));

            const movieDirectorsResult = await db
                .select()
                .from(movieDirectors)
                .where(eq(movieDirectors.movieId, movie.id));

            const movieCastsResult = await db
                .select()
                .from(movieCasts)
                .where(eq(movieCasts.movieId, movie.id));

            const movieStreamingUrlsResult = await db
                .select()
                .from(movieStreamingUrls)
                .where(eq(movieStreamingUrls.movieId, movie.id));

            return {
                ...movie,
                genres: movieGenresResult,
                countries: movieCountriesResult,
                directors: movieDirectorsResult.map(director => ({
                    id: director.id,
                    name: director.name,
                    url: director.url || undefined,
                })),
                casts: movieCastsResult.map(cast => ({
                    id: cast.id,
                    name: cast.name,
                    url: cast.url || undefined,
                })),
                streamingUrls: movieStreamingUrlsResult,
            };
        } catch (error) {
            console.error('Error getting movie by external ID:', error);
            return null;
        }
    }

    static async batchCreateMovies(moviesData: (IMovieDetails | IMovies)[]): Promise<number[]> {
        // Database operations disabled temporarily
        if (!this.isDbEnabled) {
            console.log(`[DB_DISABLED] Skipping database batch save for ${moviesData.length} movies`);
            return moviesData.map((_, index) => index + 1); // Return mock IDs
        }

        const createdIds: number[] = [];
        let successCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const movieData of moviesData) {
            try {
                const movieId = await this.createOrUpdateMovie(movieData);
                if (movieId) {
                    createdIds.push(movieId);
                    successCount++;
                } else {
                    skippedCount++;
                }
            } catch (error) {
                errorCount++;
                console.error(`Failed to process movie "${movieData.title}":`, error);
            }
        }

        console.log(`Batch processing complete: ${successCount} created/updated, ${skippedCount} skipped, ${errorCount} errors`);
        return createdIds;
    }
}