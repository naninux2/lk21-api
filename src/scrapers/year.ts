import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { ISetOfYears } from '@/types';

/**
 * Scrape a set of release years asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<ISetOfYears[]>} a set of release years
 */
export const scrapeSetOfYears = async (
    req: Request,
    res: AxiosResponse
): Promise<ISetOfYears[]> => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: ISetOfYears[] = [];
    const {
        protocol,
        headers: { host },
    } = req;

    $('.country-list > a').each((i, el) => {
        const year = $(el).text().trim();

        payload.push({
            year,
            url: `${protocol}://${host}/years/${year}`,
        });
    });

    return payload;
};
