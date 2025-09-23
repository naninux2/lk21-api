import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeMovies } from '@/scrapers/movie';
import { scrapeSetOfYears } from '@/scrapers/year';
import { ErrorResponse, SuccessResponse } from '@/types';
import https from 'https';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/years` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const setOfYears: TController = async (req, res) => {
    try {
        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.LK21_URL}/year`,
            // 'render': 'html' // If page type requires
        };

        const options = {
            hostname: "realtime.oxylabs.io",
            path: "/v1/queries",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
            },
        };

        const request = await https.request(options);
        request.write(JSON.stringify(body));
        const response = await new Promise((resolve, reject) => {
            let data = "";
            request.on("response", (res) => {
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(data);
                });
            });
            request.on("error", (error) => {
                reject(error);
            });
            request.end();
        });
        const obj = JSON.parse(response as string);
        const html = obj.results[0].content;
        const axiosRequest = {
            data: html,
            status: 200,
            statusText: 'OK',
            headers: new axios.AxiosHeaders(),
            config: {
                headers: new axios.AxiosHeaders(),
            },
        } as axios.AxiosResponse;

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

        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.LK21_URL}/year/${year}${Number(page) > 1 ? `/page/${page}` : ''}`,
            // 'render': 'html' // If page type requires
        };

        const options = {
            hostname: "realtime.oxylabs.io",
            path: "/v1/queries",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
            },
        };

        const request = await https.request(options);
        request.write(JSON.stringify(body));
        const response = await new Promise((resolve, reject) => {
            let data = "";
            request.on("response", (res) => {
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(data);
                });
            });
            request.on("error", (error) => {
                reject(error);
            });
            request.end();
        });
        const obj = JSON.parse(response as string);
        const html = obj.results[0].content;
        const axiosRequest = {
            data: html,
            status: 200,
            statusText: 'OK',
            headers: new axios.AxiosHeaders(),
            config: {
                headers: new axios.AxiosHeaders(),
            },
        } as axios.AxiosResponse;

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
