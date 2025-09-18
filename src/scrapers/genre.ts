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

    $('select[name="rgenre1"]')
        .find('option')
        .each((i, el) => {
            const genreName = $(el).text().trim();
            const genreValue = $(el).attr('value')?.trim() ?? '';
            if (genreValue && genreName && genreValue !== 'all') {
                payload.push({
                    name: genreName,
                    url: `${protocol}://${host}/genres/${genreValue}`,
                });
            }
        });

    return payload;
};
