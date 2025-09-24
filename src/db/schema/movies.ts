import { pgTable, serial, varchar, text, timestamp, decimal, uniqueIndex, integer } from 'drizzle-orm/pg-core';
import { genres } from './genres';
import { countries } from './countries';

export const movies = pgTable('movies', {
    id: serial('id').primaryKey(),
    externalId: varchar('external_id', { length: 255 }).notNull(), // The _id from scraping
    title: varchar('title', { length: 500 }).notNull(),
    type: varchar('type', { length: 20 }).notNull().default('movie'),
    posterImg: text('poster_img'),
    rating: varchar('rating', { length: 10 }),
    url: varchar('url', { length: 500 }),
    qualityResolution: varchar('quality_resolution', { length: 50 }),
    quality: varchar('quality', { length: 50 }),
    duration: varchar('duration', { length: 50 }),
    year: varchar('year', { length: 10 }),
    releaseDate: varchar('release_date', { length: 100 }),
    synopsis: text('synopsis'),
    trailerUrl: text('trailer_url'),
    downloadUrl: text('download_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        externalIdIdx: uniqueIndex('movies_external_id_idx').on(table.externalId),
        // Removed title unique index - movies can have same title with different external_id
        // titleIdx: uniqueIndex('movies_title_idx').on(table.title),
    };
});

// Junction table for movie-genre relationships
export const movieGenres = pgTable('movie_genres', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        movieGenreIdx: uniqueIndex('movie_genres_movie_genre_idx').on(table.movieId, table.genreId),
    };
});

// Junction table for movie-country relationships
export const movieCountries = pgTable('movie_countries', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    countryId: integer('country_id').notNull().references(() => countries.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        movieCountryIdx: uniqueIndex('movie_countries_movie_country_idx').on(table.movieId, table.countryId),
    };
});

// Table for movie directors
export const movieDirectors = pgTable('movie_directors', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// Table for movie casts
export const movieCasts = pgTable('movie_casts', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// Table for movie streaming URLs
export const movieStreamingUrls = pgTable('movie_streaming_urls', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 100 }).notNull(),
    url: text('url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
export type MovieGenre = typeof movieGenres.$inferSelect;
export type NewMovieGenre = typeof movieGenres.$inferInsert;
export type MovieCountry = typeof movieCountries.$inferSelect;
export type NewMovieCountry = typeof movieCountries.$inferInsert;
export type MovieDirector = typeof movieDirectors.$inferSelect;
export type NewMovieDirector = typeof movieDirectors.$inferInsert;
export type MovieCast = typeof movieCasts.$inferSelect;
export type NewMovieCast = typeof movieCasts.$inferInsert;
export type MovieStreamingUrl = typeof movieStreamingUrls.$inferSelect;
export type NewMovieStreamingUrl = typeof movieStreamingUrls.$inferInsert;