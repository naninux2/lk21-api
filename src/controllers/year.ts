import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeMovies } from '@/scrapers/movie';
import { scrapeSetOfYears } from '@/scrapers/year';
import { ErrorResponse, SuccessResponse } from '@/types';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/years` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const setOfYears: TController = async (req, res) => {
    try {
        const axiosRequest = await axios.get(
            `${process.env.LK21_URL}/year`
        );

        const payload = await scrapeSetOfYears(req, axiosRequest);

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Set of years fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);

    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch set of years'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/years/:year` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const moviesByYear: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;
        const { year } = req.params;

        const axiosRequest = await axios.get(
            `${process.env.LK21_URL}/year/${year}${Number(page) > 1 ? `/page/${page}` : ''
            }`
        );

        const payload = await scrapeMovies(req, axiosRequest);

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: `Movies from ${year} fetched successfully`,
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch movies by year'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};
