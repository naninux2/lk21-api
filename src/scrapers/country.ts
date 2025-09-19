import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { ISetOfCountries } from '@/types';
import countries from '@/json/countries.json';

/**
 * Scrape a set of countries asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<ISetOfCountries[]>} a set of countries
 */
export const scrapeSetOfCountries = async (
    req: Request,
    res: AxiosResponse
) => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: ISetOfCountries[] = [];
    const {
        protocol,
        headers: { host },
    } = req;

    $('select[name="rcountry"]').find('option').each((i, el) => {
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
