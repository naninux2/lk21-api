import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeSeries, scrapeSeriesDetails } from '@/scrapers/series';
import { ErrorResponse, SuccessResponse } from '@/types';
import { SeriesService } from '@/db/services';
import https from 'https';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/series` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const latestSeries: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.ND_URL}/latest-series${Number(page) > 1 ? `/page/${page}` : ''}`,
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

        const payload = await scrapeSeries(req, axiosRequest);

        // Save series to database (async, don't wait)
        if (payload.items && payload.items.length > 0) {
            SeriesService.batchCreateSeries(payload.items).catch(error => {
                console.error('Error saving latest series to database:', error);
            });
        }

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Latest series fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);
        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch latest series'],
            error: (err as Error).message,
            error_code: '500',
        }
        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/popular/series` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const popularSeries: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.ND_URL}/populer${Number(page) > 1 ? `/page/${page}` : ''}`,
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

        const payload = await scrapeSeries(req, axiosRequest);

        // Save series to database (async, don't wait)
        if (payload.items && payload.items.length > 0) {
            SeriesService.batchCreateSeries(payload.items).catch(error => {
                console.error('Error saving popular series to database:', error);
            });
        }

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Popular series fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch popular series'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/recent-release/series` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const recentReleaseSeries: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.ND_URL}/release${Number(page) > 1 ? `/page/${page}` : ''}`,
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

        const payload = await scrapeSeries(req, axiosRequest);

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Recent release series fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);

    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch recent release series'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/top-rated/series` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const topRatedSeries: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;

        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.ND_URL}/rating${Number(page) > 1 ? `/page/${page}` : ''}`,
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

        const payload = await scrapeSeries(req, axiosRequest);

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Top rated series fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch top rated series'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};

/**
 * Controller for `/series/:seriesId` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const seriesDetails: TController = async (req, res) => {
    try {
        const { id } = req.params;

        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;

        const body = {
            source: "universal",
            url: `${process.env.ND_URL}/${id}`,
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

        const payload = await scrapeSeriesDetails(req, axiosRequest);

        // Save series details to database (async, don't wait)
        SeriesService.createOrUpdateSeries(payload).catch(error => {
            console.error('Error saving series details to database:', error);
        });

        const successResponse: SuccessResponse<typeof payload> = {
            success: true,
            message: 'Series details fetched successfully',
            data: payload,
        }

        res.status(200).json(successResponse);
    } catch (err) {
        console.error(err);

        const errorResponse: ErrorResponse = {
            success: false,
            message: ['Failed to fetch series details'],
            error: (err as Error).message,
            error_code: '500',
        }

        res.status(500).json(errorResponse);
    }
};
