import { pgTable, serial, varchar, text, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { genres } from './genres';
import { countries } from './countries';

export const series = pgTable('series', {
    id: serial('id').primaryKey(),
    externalId: varchar('external_id', { length: 255 }).notNull(), // The _id from scraping
    title: varchar('title', { length: 500 }).notNull(),
    type: varchar('type', { length: 20 }).notNull().default('series'),
    posterImg: text('poster_img'),
    rating: varchar('rating', { length: 10 }),
    url: varchar('url', { length: 500 }),
    qualityResolution: varchar('quality_resolution', { length: 50 }),
    duration: varchar('duration', { length: 50 }),
    year: varchar('year', { length: 10 }),
    status: varchar('status', { length: 50 }),
    releaseDate: varchar('release_date', { length: 100 }),
    synopsis: text('synopsis'),
    trailerUrl: text('trailer_url'),
    episode: integer('episode'), // For ISeries interface
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        externalIdIdx: uniqueIndex('series_external_id_idx').on(table.externalId),
        titleIdx: uniqueIndex('series_title_idx').on(table.title),
    };
});

// Seasons table
export const seasons = pgTable('seasons', {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
    season: integer('season').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        seriesSeasonIdx: uniqueIndex('seasons_series_season_idx').on(table.seriesId, table.season),
    };
});

// Episodes table
export const episodes = pgTable('episodes', {
    id: serial('id').primaryKey(),
    seasonId: integer('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
    episode: integer('episode').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    url: varchar('url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Junction table for series-genre relationships
export const seriesGenres = pgTable('series_genres', {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        seriesGenreIdx: uniqueIndex('series_genres_series_genre_idx').on(table.seriesId, table.genreId),
    };
});

// Junction table for series-country relationships
export const seriesCountries = pgTable('series_countries', {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
    countryId: integer('country_id').notNull().references(() => countries.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        seriesCountryIdx: uniqueIndex('series_countries_series_country_idx').on(table.seriesId, table.countryId),
    };
});

// Table for series directors
export const seriesDirectors = pgTable('series_directors', {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// Table for series casts
export const seriesCasts = pgTable('series_casts', {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// Table for episode streaming URLs (for IEpisodeDetails)
export const episodeStreamingUrls = pgTable('episode_streaming_urls', {
    id: serial('id').primaryKey(),
    episodeId: integer('episode_id').notNull().references(() => episodes.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 100 }).notNull(),
    url: text('url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
export type SeriesGenre = typeof seriesGenres.$inferSelect;
export type NewSeriesGenre = typeof seriesGenres.$inferInsert;
export type SeriesCountry = typeof seriesCountries.$inferSelect;
export type NewSeriesCountry = typeof seriesCountries.$inferInsert;
export type SeriesDirector = typeof seriesDirectors.$inferSelect;
export type NewSeriesDirector = typeof seriesDirectors.$inferInsert;
export type SeriesCast = typeof seriesCasts.$inferSelect;
export type NewSeriesCast = typeof seriesCasts.$inferInsert;
export type EpisodeStreamingUrl = typeof episodeStreamingUrls.$inferSelect;
export type NewEpisodeStreamingUrl = typeof episodeStreamingUrls.$inferInsert;