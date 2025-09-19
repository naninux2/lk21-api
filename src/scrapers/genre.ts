import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { ISetOfGenres } from '@/types';
import genres from '@/json/genres.json';

/**
 * Scrape a set of genres asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<ISetOfGenres[]>} a set of genres
 */
export const scrapeSetOfGenres = async (
    req: Request,
    res: AxiosResponse
): Promise<ISetOfGenres[]> => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: ISetOfGenres[] = [];
    const {
        headers: { host },
        protocol,
    } = req;

    $('select[name="rgenre1"]').find('option').each((i, el) => {
        if (i === 0) return;

        const value = $(el).attr('value') ?? '';
        const name = $(el).text().trim();

        payload.push({
            name,
            url: `${protocol}://${host}/countries/${value.toLowerCase()}`,
        });

    });

    return payload;
};
