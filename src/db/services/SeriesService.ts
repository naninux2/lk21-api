import { db } from '../index';
import {
    series,
    seasons,
    episodes,
    seriesGenres,
    seriesCountries,
    seriesDirectors,
    seriesCasts,
    episodeStreamingUrls,
    genres,
    countries
} from '../schema';
import { eq } from 'drizzle-orm';
import { ISeriesDetails, ISeries, ISeasonsList, DbSeriesWithRelations } from '@/types';
import { CategoryService } from './CategoryService';

export class SeriesService {

    static async createOrUpdateSeries(seriesData: ISeriesDetails | ISeries): Promise<number | null> {
        try {
            const isDetails = 'synopsis' in seriesData;

            // Insert or update series
            const [seriesRecord] = await db
                .insert(series)
                .values({
                    externalId: seriesData._id,
                    title: seriesData.title,
                    type: seriesData.type,
                    posterImg: seriesData.posterImg,
                    rating: seriesData.rating,
                    url: 'url' in seriesData ? seriesData.url : undefined,
                    qualityResolution: seriesData.qualityResolution,
                    duration: seriesData.duration,
                    year: seriesData.year,
                    status: isDetails ? (seriesData as ISeriesDetails).status : undefined,
                    releaseDate: isDetails ? (seriesData as ISeriesDetails).releaseDate : undefined,
                    synopsis: isDetails ? (seriesData as ISeriesDetails).synopsis : undefined,
                    trailerUrl: isDetails ? (seriesData as ISeriesDetails).trailerUrl : undefined,
                    episode: seriesData.episode,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: series.externalId,
                    set: {
                        title: seriesData.title,
                        posterImg: seriesData.posterImg,
                        rating: seriesData.rating,
                        qualityResolution: seriesData.qualityResolution,
                        duration: seriesData.duration,
                        year: seriesData.year,
                        episode: seriesData.episode,
                        ...(isDetails && {
                            status: (seriesData as ISeriesDetails).status,
                            releaseDate: (seriesData as ISeriesDetails).releaseDate,
                            synopsis: (seriesData as ISeriesDetails).synopsis,
                            trailerUrl: (seriesData as ISeriesDetails).trailerUrl,
                        }),
                        updatedAt: new Date(),
                    }
                })
                .returning();

            if (!seriesRecord) return null;

            // Handle genres
            if (seriesData.genres && seriesData.genres.length > 0) {
                await this.updateSeriesGenres(seriesRecord.id, seriesData.genres);
            }

            // Handle countries (only for detailed series)
            if (isDetails && (seriesData as ISeriesDetails).countries) {
                await this.updateSeriesCountries(seriesRecord.id, (seriesData as ISeriesDetails).countries);
            }

            // Handle directors (only for detailed series)
            if (isDetails && (seriesData as ISeriesDetails).directors) {
                await this.updateSeriesDirectors(seriesRecord.id, (seriesData as ISeriesDetails).directors);
            }

            // Handle casts (only for detailed series)
            if (isDetails && (seriesData as ISeriesDetails).casts) {
                await this.updateSeriesCasts(seriesRecord.id, (seriesData as ISeriesDetails).casts);
            }

            // Handle seasons and episodes (only for detailed series)
            if (isDetails && (seriesData as ISeriesDetails).seasons) {
                await this.updateSeriesSeasons(seriesRecord.id, (seriesData as ISeriesDetails).seasons);
            }

            return seriesRecord.id;
        } catch (error) {
            console.error('Error creating/updating series:', error);
            return null;
        }
    }

    private static async updateSeriesGenres(seriesId: number, genreData: { name: string; url: string }[]) {
        try {
            // Delete existing genres
            await db.delete(seriesGenres).where(eq(seriesGenres.seriesId, seriesId));

            // Create new genre associations
            for (const genreItem of genreData) {
                const slug = CategoryService.createSlug(genreItem.name);
                const genre = await CategoryService.createGenre(genreItem.name, slug);

                if (genre) {
                    await db.insert(seriesGenres).values({
                        seriesId: seriesId,
                        genreId: genre.id
                    });
                }
            }
        } catch (error) {
            console.error('Error updating series genres:', error);
        }
    }

    private static async updateSeriesCountries(seriesId: number, countryData: { name: string; url: string }[]) {
        try {
            // Delete existing countries
            await db.delete(seriesCountries).where(eq(seriesCountries.seriesId, seriesId));

            // Create new country associations
            for (const countryItem of countryData) {
                const slug = CategoryService.createSlug(countryItem.name);
                const country = await CategoryService.createCountry(countryItem.name, slug);

                if (country) {
                    await db.insert(seriesCountries).values({
                        seriesId: seriesId,
                        countryId: country.id
                    });
                }
            }
        } catch (error) {
            console.error('Error updating series countries:', error);
        }
    }

    private static async updateSeriesDirectors(seriesId: number, directorData: { name: string; url: string }[]) {
        try {
            // Delete existing directors
            await db.delete(seriesDirectors).where(eq(seriesDirectors.seriesId, seriesId));

            // Create new directors
            const directorsToInsert = directorData.map(director => ({
                seriesId: seriesId,
                name: director.name,
                url: director.url
            }));

            if (directorsToInsert.length > 0) {
                await db.insert(seriesDirectors).values(directorsToInsert);
            }
        } catch (error) {
            console.error('Error updating series directors:', error);
        }
    }

    private static async updateSeriesCasts(seriesId: number, castData: { name: string; url: string }[]) {
        try {
            // Delete existing casts
            await db.delete(seriesCasts).where(eq(seriesCasts.seriesId, seriesId));

            // Create new casts
            const castsToInsert = castData.map(cast => ({
                seriesId: seriesId,
                name: cast.name,
                url: cast.url
            }));

            if (castsToInsert.length > 0) {
                await db.insert(seriesCasts).values(castsToInsert);
            }
        } catch (error) {
            console.error('Error updating series casts:', error);
        }
    }

    private static async updateSeriesSeasons(seriesId: number, seasonsData: ISeasonsList[]) {
        try {
            // Delete existing seasons (episodes will be cascade deleted)
            await db.delete(seasons).where(eq(seasons.seriesId, seriesId));

            // Create new seasons and episodes
            for (const seasonData of seasonsData) {
                const [seasonRecord] = await db.insert(seasons).values({
                    seriesId: seriesId,
                    season: seasonData.season
                }).returning();

                if (seasonRecord && seasonData.episodes.length > 0) {
                    const episodesToInsert = seasonData.episodes.map(episode => ({
                        seasonId: seasonRecord.id,
                        episode: episode.episode,
                        title: episode.title,
                        url: episode.url
                    }));

                    await db.insert(episodes).values(episodesToInsert);
                }
            }
        } catch (error) {
            console.error('Error updating series seasons:', error);
        }
    }

    static async getSeriesByExternalId(externalId: string): Promise<DbSeriesWithRelations | null> {
        try {
            const result = await db
                .select({
                    id: series.id,
                    externalId: series.externalId,
                    title: series.title,
                    type: series.type,
                    posterImg: series.posterImg,
                    rating: series.rating,
                    url: series.url,
                    qualityResolution: series.qualityResolution,
                    duration: series.duration,
                    year: series.year,
                    status: series.status,
                    releaseDate: series.releaseDate,
                    synopsis: series.synopsis,
                    trailerUrl: series.trailerUrl,
                    episode: series.episode,
                })
                .from(series)
                .where(eq(series.externalId, externalId))
                .limit(1);

            if (!result || result.length === 0) return null;

            const seriesRecord = result[0];

            // Get related data
            const seriesGenresResult = await db
                .select({
                    id: genres.id,
                    name: genres.name,
                    slug: genres.slug,
                })
                .from(seriesGenres)
                .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
                .where(eq(seriesGenres.seriesId, seriesRecord.id));

            const seriesCountriesResult = await db
                .select({
                    id: countries.id,
                    name: countries.name,
                    slug: countries.slug,
                })
                .from(seriesCountries)
                .innerJoin(countries, eq(seriesCountries.countryId, countries.id))
                .where(eq(seriesCountries.seriesId, seriesRecord.id));

            const seriesDirectorsResult = await db
                .select()
                .from(seriesDirectors)
                .where(eq(seriesDirectors.seriesId, seriesRecord.id));

            const seriesCastsResult = await db
                .select()
                .from(seriesCasts)
                .where(eq(seriesCasts.seriesId, seriesRecord.id));

            // Get seasons with episodes
            const seasonsResult = await db
                .select()
                .from(seasons)
                .where(eq(seasons.seriesId, seriesRecord.id))
                .orderBy(seasons.season);

            const seasonsWithEpisodes = [];
            for (const season of seasonsResult) {
                const episodesResult = await db
                    .select()
                    .from(episodes)
                    .where(eq(episodes.seasonId, season.id))
                    .orderBy(episodes.episode);

                const episodesWithStreaming = [];
                for (const episode of episodesResult) {
                    const streamingUrls = await db
                        .select()
                        .from(episodeStreamingUrls)
                        .where(eq(episodeStreamingUrls.episodeId, episode.id));

                    episodesWithStreaming.push({
                        ...episode,
                        url: episode.url || undefined,
                        streamingUrls: streamingUrls
                    });
                }

                seasonsWithEpisodes.push({
                    ...season,
                    episodes: episodesWithStreaming
                });
            }

            return {
                ...seriesRecord,
                genres: seriesGenresResult,
                countries: seriesCountriesResult,
                directors: seriesDirectorsResult.map(director => ({
                    id: director.id,
                    name: director.name,
                    url: director.url || undefined,
                })),
                casts: seriesCastsResult.map(cast => ({
                    id: cast.id,
                    name: cast.name,
                    url: cast.url || undefined,
                })),
                seasons: seasonsWithEpisodes,
            };
        } catch (error) {
            console.error('Error getting series by external ID:', error);
            return null;
        }
    }

    static async batchCreateSeries(seriesData: (ISeriesDetails | ISeries)[]): Promise<number[]> {
        const createdIds: number[] = [];

        for (const seriesItem of seriesData) {
            const seriesId = await this.createOrUpdateSeries(seriesItem);
            if (seriesId) {
                createdIds.push(seriesId);
            }
        }

        return createdIds;
    }

    // Method to add streaming URLs for episodes (for IEpisodeDetails)
    static async addEpisodeStreamingUrls(episodeId: number, streamingUrls: { provider: string; url: string }[]) {
        try {
            // Delete existing streaming URLs
            await db.delete(episodeStreamingUrls).where(eq(episodeStreamingUrls.episodeId, episodeId));

            // Create new streaming URLs
            const streamingUrlsToInsert = streamingUrls.map(stream => ({
                episodeId: episodeId,
                provider: stream.provider,
                url: stream.url
            }));

            if (streamingUrlsToInsert.length > 0) {
                await db.insert(episodeStreamingUrls).values(streamingUrlsToInsert);
            }
        } catch (error) {
            console.error('Error updating episode streaming URLs:', error);
        }
    }
}