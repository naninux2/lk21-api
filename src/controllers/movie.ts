import axios from 'axios';
import { NextFunction as Next, Request, Response, response } from 'express';
import { scrapeMovieDetails, scrapeMovies } from '@/scrapers/movie';
import { ErrorResponse, SuccessResponse } from '@/types';
import { MovieService } from '@/db/services';
import { ProxyManager } from '@/utils/proxy';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/movies` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const latestMovies: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const url = `${process.env.LK21_URL}/latest${Number(page) > 1 ? `/page/${page}` : ''}`;
        const axiosRequest = await ProxyManager.makeRequestWithProxy(url);

        const payload = await scrapeMovies(req, axiosRequest);

        // Save movies to database (async, don't wait)
        if (payload.items && payload.items.length > 0) {
            MovieService.batchCreateMovies(payload.items).catch(error => {
                console.error('Error saving latest movies to database:', error);
            });
        }

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Latest movies fetched successfully',
            data: payload,
        }
        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch latest movies'],
            error: (err as Error).message,
            error_code: '500',
        }
        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/popular/movies` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const popularMovies: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const url = `${process.env.LK21_URL}/popular${Number(page) > 1 ? `/page/${page}` : ''}`;
        const axiosRequest = await ProxyManager.makeRequestWithProxy(url);


        // scrape popular movies
        const payload = await scrapeMovies(req, axiosRequest);

        // Save movies to database (async, don't wait)
        if (payload.items && payload.items.length > 0) {
            MovieService.batchCreateMovies(payload.items).catch(error => {
                console.error('Error saving popular movies to database:', error);
            });
        }

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Popular movies fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);

    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch popular movies'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/recent-release/movies` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const recentReleaseMovies: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const url = `${process.env.LK21_URL}/release${Number(page) > 1 ? `/page/${page}` : ''}`;
        const axiosRequest = await ProxyManager.makeRequestWithProxy(url);

        const payload = await scrapeMovies(req, axiosRequest);

        // Save movies to database (async, don't wait)
        if (payload.items && payload.items.length > 0) {
            MovieService.batchCreateMovies(payload.items).catch(error => {
                console.error('Error saving recent release movies to database:', error);
            });
        }

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Recent release movies fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch recent release movies'],
            error: (err as Error).message,
            error_code: '500',
        }
        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/top-rated/movies` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const topRatedMovies: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const url = `${process.env.LK21_URL}/rating${Number(page) > 1 ? `/page/${page}` : ''}`;
        const axiosRequest = await ProxyManager.makeRequestWithProxy(url);

        const payload = await scrapeMovies(req, axiosRequest);

        // Save movies to database (async, don't wait)
        if (payload.items && payload.items.length > 0) {
            MovieService.batchCreateMovies(payload.items).catch(error => {
                console.error('Error saving top rated movies to database:', error);
            });
        }

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Top rated movies fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch top rated movies'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/movies/{movieId}` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const movieDetails: TController = async (req, res) => {
    try {
        const { id } = req.params;

        const url = `${process.env.LK21_URL}/${id}`;
        const axiosRequest = await ProxyManager.makeRequestWithProxy(url);

        // find from database first
        const movieFromDb = await MovieService.getMovieByExternalId(id);
        if (movieFromDb) {
            const successResponse: SuccessResponse<typeof movieFromDb> = {
                success: true,
                message: 'Movie details fetched successfully',
                data: movieFromDb,
            }
            res.status(200).json(successResponse);
        }


        const payload = await scrapeMovieDetails(req, axiosRequest);

        // Save movie details to database (async, don't wait)
        MovieService.createOrUpdateMovie(payload).catch(error => {
            console.error('Error saving movie details to database:', error);
        });

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Movie details fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch movie details'],
            error: (err as Error).message,
            error_code: '500',
        }
        res.status(500).json(errorResponse);
    }
};