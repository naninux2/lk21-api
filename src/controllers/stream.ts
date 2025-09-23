import axios from 'axios';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeStreamSources } from '@/scrapers/stream';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/movies/:movieId/streams` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const streamMovie: TController = async (req, res) => {
    try {
        const { originalUrl } = req;

        const movieId = originalUrl.split('/').reverse()[1];
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
            `${process.env.LK21_URL}/${movieId}`,
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

        const payload = await scrapeStreamSources(req, axiosRequest);

        res.status(200).json(payload);
    } catch (err) {
        console.error(err);

        res.status(400).json(null);
    }
};

/**
 * Controller for `/series/:seriesId/streams` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const streamSeries: TController = async (req, res) => {
    try {
        const { originalUrl } = req;
        const newUrl = originalUrl.replace('/episodes/', '');
        console.log(newUrl);
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
            `${process.env.ND_URL}/${newUrl}`,
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

        const payload = await scrapeStreamSources(req, axiosRequest);

        res.status(200).json(payload);
    } catch (err) {
        console.error(err);

        res.status(400).json(null);
    }
};
