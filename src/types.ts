export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface PaginationResponse<T> {
    items: T[];
    total_items: number;
    total_page: number;
    offset: number;
    limit: number;
    page: number;
    next_page?: number | null;
    prev_page?: number | null;
}

export interface SuccessResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ErrorResponse {
    success: boolean;
    message: Array<string>;
    error?: string;
    error_code?: '400' | '401' | '403' | '404' | '422' | '500' | string;
    data?: Record<string, unknown> | string;
}

export interface IMovies {
    _id: string;
    title: string;
    type: 'movie' | 'series';
    posterImg: string;
    rating: string;
    url: string;
    qualityResolution: string;
    genres: { name: string, url: string }[];
    duration: string;
    year: string;
}

export interface IMovieDetails
    extends Omit<IMovies, 'url' | 'qualityResolution'> {
    quality: string;
    releaseDate: string;
    synopsis: string;
    duration: string;
    trailerUrl: string;
    directors: { name: string, url: string }[];
    countries: { name: string, url: string }[];
    casts: { name: string, url: string }[];
    streaming_url: { provider: string; url: string }[];
    download_url: string;
    rating: string;
}

export interface IStreamSources {
    provider: string;
    url: string;
    resolutions: string[];
}

export interface ISetOfGenres {
    name: string;
    url: string;
}

export interface ISetOfCountries {
    name: string;
    url: string;
}

export interface ISetOfYears {
    year: string;
    url: string;
}

export interface ISeries extends Omit<IMovies, 'qualityResolution'> {
    episode: number;
    qualityResolution: string;
}

export interface ISeasonsList {
    season: number;
    // totalEpisodes: number;
    episodes: { episode: number; title: string; url: string }[];
}

export interface ISeriesDetails extends Omit<ISeries, 'url'> {
    status: string;
    releaseDate: string;
    synopsis: string;
    duration: string;
    trailerUrl: string;
    directors: { name: string, url: string }[];
    countries: { name: string, url: string }[];
    casts: { name: string, url: string }[];
    seasons: ISeasonsList[];
}
export interface IEpisodeDetails extends Omit<ISeries, 'url'> {
    status: string;
    releaseDate: string;
    synopsis: string;
    duration: string;
    trailerUrl: string;
    directors: { name: string, url: string }[];
    countries: { name: string, url: string }[];
    casts: { name: string, url: string }[];
    seasons: ISeasonsList[];
    streaming_url: { provider: string; url: string }[];
}

export interface ISearchedMoviesOrSeries {
    _id: string;
    title: string;
    type: string;
    posterImg: string;
    url: string;
    genres: { name: string, url: string }[];
    directors: { name: string, url: string }[];
    casts: { name: string, url: string }[];
    rating: string;
    qualityResolution: string;
    duration: string;
    year: string;
}

export interface IDownloads {
    server: string;
    link: string;
    quality: string;
}

// Database-specific types
export interface DbMovieWithRelations {
    id: number;
    externalId: string;
    title: string;
    type: string;
    posterImg?: string | null;
    rating?: string | null;
    url?: string | null;
    qualityResolution?: string | null;
    quality?: string | null;
    duration?: string | null;
    year?: string | null;
    releaseDate?: string | null;
    synopsis?: string | null;
    trailerUrl?: string | null;
    downloadUrl?: string | null;
    genres: { id: number; name: string; slug: string }[];
    countries: { id: number; name: string; slug: string }[];
    directors: { id: number; name: string; url?: string }[];
    casts: { id: number; name: string; url?: string }[];
    streamingUrls: { id: number; provider: string; url: string }[];
}

export interface DbSeriesWithRelations {
    id: number;
    externalId: string;
    title: string;
    type: string;
    posterImg?: string | null;
    rating?: string | null;
    url?: string | null;
    qualityResolution?: string | null;
    duration?: string | null;
    year?: string | null;
    status?: string | null;
    releaseDate?: string | null;
    synopsis?: string | null;
    trailerUrl?: string | null;
    episode?: number | null;
    genres: { id: number; name: string; slug: string }[];
    countries: { id: number; name: string; slug: string }[];
    directors: { id: number; name: string; url?: string }[];
    casts: { id: number; name: string; url?: string }[];
    seasons: {
        id: number;
        season: number;
        episodes: {
            id: number;
            episode: number;
            title: string;
            url?: string;
            streamingUrls: { id: number; provider: string; url: string }[];
        }[];
    }[];
}
