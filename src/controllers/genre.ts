import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeSetOfGenres } from '@/scrapers/genre';
import { scrapeMovies } from '@/scrapers/movie';
import { ErrorResponse, SuccessResponse } from '@/types';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/genres` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const setOfGenres: TController = async (req, res) => {
    try {
        const axiosRequest = await axios.get(`${process.env.LK21_URL}/rekomendasi-film-pintar`);

        const payload = await scrapeSetOfGenres(req, axiosRequest);

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Set of genres fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);

    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch set of genres'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/genres/:genre` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const moviesByGenre: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;
        const { genre } = req.params;

        const axiosRequest = await axios.get(
            `${process.env.LK21_URL}/genre/${genre.toLowerCase()}${Number(page) > 1 ? `/page/${page}` : ''
            }`
        );

        const payload = await scrapeMovies(req, axiosRequest);
        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: `Movies from ${genre} fetched successfully`,
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch movies by genre'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};
