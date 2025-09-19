CREATE TABLE "genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "years" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movie_casts" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movie_countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movie_directors" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movie_streaming_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"provider" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"type" varchar(20) DEFAULT 'movie' NOT NULL,
	"poster_img" text,
	"rating" varchar(10),
	"url" varchar(500),
	"quality_resolution" varchar(50),
	"quality" varchar(50),
	"duration" varchar(50),
	"year" varchar(10),
	"release_date" varchar(100),
	"synopsis" text,
	"trailer_url" text,
	"download_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episode_streaming_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer NOT NULL,
	"provider" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"episode" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"season" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"type" varchar(20) DEFAULT 'series' NOT NULL,
	"poster_img" text,
	"rating" varchar(10),
	"url" varchar(500),
	"quality_resolution" varchar(50),
	"duration" varchar(50),
	"year" varchar(10),
	"status" varchar(50),
	"release_date" varchar(100),
	"synopsis" text,
	"trailer_url" text,
	"episode" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_casts" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_directors" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "series_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "movie_casts" ADD CONSTRAINT "movie_casts_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_countries" ADD CONSTRAINT "movie_countries_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_countries" ADD CONSTRAINT "movie_countries_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_directors" ADD CONSTRAINT "movie_directors_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_streaming_urls" ADD CONSTRAINT "movie_streaming_urls_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_streaming_urls" ADD CONSTRAINT "episode_streaming_urls_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_casts" ADD CONSTRAINT "series_casts_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_countries" ADD CONSTRAINT "series_countries_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_countries" ADD CONSTRAINT "series_countries_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_directors" ADD CONSTRAINT "series_directors_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_genres" ADD CONSTRAINT "series_genres_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_genres" ADD CONSTRAINT "series_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "genres_slug_idx" ON "genres" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_name_idx" ON "genres" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_slug_idx" ON "countries" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_name_idx" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "years_name_idx" ON "years" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_countries_movie_country_idx" ON "movie_countries" USING btree ("movie_id","country_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_genres_movie_genre_idx" ON "movie_genres" USING btree ("movie_id","genre_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movies_external_id_idx" ON "movies" USING btree ("external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movies_title_idx" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_series_season_idx" ON "seasons" USING btree ("series_id","season");--> statement-breakpoint
CREATE UNIQUE INDEX "series_external_id_idx" ON "series" USING btree ("external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "series_title_idx" ON "series" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "series_countries_series_country_idx" ON "series_countries" USING btree ("series_id","country_id");--> statement-breakpoint
CREATE UNIQUE INDEX "series_genres_series_genre_idx" ON "series_genres" USING btree ("series_id","genre_id");