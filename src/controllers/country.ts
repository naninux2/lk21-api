import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeSetOfCountries } from '@/scrapers/country';
import { scrapeMovies } from '@/scrapers/movie';
import { ErrorResponse, SuccessResponse } from '@/types';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/countries` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const setOfCountries: TController = async (req, res) => {
    try {
        const axiosRequest = await axios.get(
            `${process.env.LK21_URL}/rekomendasi-film-pintar`
        );

        const payload = await scrapeSetOfCountries(req, axiosRequest);


        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Set of countries fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch set of countries'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/countries/{country}` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const moviesByCountry: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;
        const { country } = req.params;

        const axiosRequest = await axios.get(
            `${process.env.LK21_URL}/country/${country.toLowerCase()}${Number(page) > 1 ? `/page/${page}` : ''
            }`
        );

        const payload = await scrapeMovies(req, axiosRequest);

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: `Movies from ${country} fetched successfully`,
            data: payload,
        }

        res.status(200).json(successResponse);

    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch movies by country'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};
