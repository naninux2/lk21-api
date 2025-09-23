import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeMovies } from '@/scrapers/movie';
import { scrapeSetOfYears } from '@/scrapers/year';
import { ErrorResponse, SuccessResponse } from '@/types';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/years` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const setOfYears: TController = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            headless: false, // Avoid headless if site fingerprinting is aggressive
            args: ['--no-sandbox'], // Required in some CI environments — otherwise omit for local runs
        });

        const pageBrowser = await browser.newPage();
        await pageBrowser.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        );

        await pageBrowser.setViewport({
            width: Math.floor(1024 + Math.random() * 100),
            height: Math.floor(768 + Math.random() * 100),
        });

        await pageBrowser.goto(
            `${process.env.LK21_URL}/year`,
            { waitUntil: 'domcontentloaded' }
        );
        await pageBrowser.waitForSelector('.main-header', { timeout: 10000 });
        const html = await pageBrowser.content();
        await browser.close();

        // Mock axios response object
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
        const browser = await puppeteer.launch({
            headless: false, // Avoid headless if site fingerprinting is aggressive
            args: ['--no-sandbox'], // Required in some CI environments — otherwise omit for local runs
        });

        const pageBrowser = await browser.newPage();
        await pageBrowser.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        );

        await pageBrowser.setViewport({
            width: Math.floor(1024 + Math.random() * 100),
            height: Math.floor(768 + Math.random() * 100),
        });

        await pageBrowser.goto(
            `${process.env.LK21_URL}/year/${year}${Number(page) > 1 ? `/page/${page}` : ''}`,
            { waitUntil: 'domcontentloaded' }
        );
        await pageBrowser.waitForSelector('.main-header', { timeout: 10000 });
        const html = await pageBrowser.content();
        await browser.close();

        // Mock axios response object
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
