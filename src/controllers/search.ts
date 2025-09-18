import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeSearchedMoviesOrSeries } from '@/scrapers/search';
import playwright from 'playwright';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for /search/:title` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const searchedMoviesOrSeries: TController = async (req, res) => {
    try {
        const { title = '' } = req.params;
        const browser = await playwright.chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(`${process.env.LK21_URL}/search?s=${title}`, { waitUntil: 'networkidle' });
        const content = await page.content();
        await browser.close();

        const axiosRequest = { data: content } as unknown as axios.AxiosResponse;

        const payload = await scrapeSearchedMoviesOrSeries(req, axiosRequest);

        res.status(200).json(payload);
    } catch (err) {
        console.error(err);

        res.status(400).json(null);
    }
};
