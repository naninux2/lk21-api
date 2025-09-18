import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { ISearchedMoviesOrSeries } from '@/types';

/**
 * Scrape searched movies or series
 * @param {Request} req
 * @param {AxiosResponse} res
 * @returns {Promise.<ISearchedMoviesOrSeries[]>} array of movies or series
 */
export const scrapeSearchedMoviesOrSeries = async (
    req: Request,
    res: AxiosResponse
): Promise<ISearchedMoviesOrSeries[]> => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: ISearchedMoviesOrSeries[] = [];
    const {
        headers: { host },
        protocol,
    } = req;

    $('#results')
        .find('article')
        .each((i, el) => {
            console.log(el);
            const genres: { name: string, url: string }[] = [];
            const findGenres = $(el)
                .find('meta[itemprop="genre"]')
                .attr('content');

            if (findGenres) {
                findGenres.split(',').forEach((genre) => {
                    const genreUrl = genre.toLowerCase().replace(/\s+/g, '-');
                    genres.push(
                        { name: genre.trim(), url: `${protocol}://${host}/genres/${genreUrl}` }
                    );
                });
            }

            const movieId: string =
                $(el)
                    .find('a')
                    .attr('href')
                    ?.split('/')
                    .reverse()[0] ?? '';

            const obj = {} as ISearchedMoviesOrSeries;

            let type = 'movie';
            // get alt from img. check if contains Series then type is series
            const altText = $(el).find('figure img').attr('alt') || '';
            if (altText.toLowerCase().includes('series')) {
                type = 'series';
            }

            obj['_id'] = movieId;
            obj['title'] =
                $(el).find('.poster-title').text() ?? '';
            obj['type'] = type;
            obj['posterImg'] = `${$(el)
                .find('figure img')
                .attr('src')}`;
            obj['rating'] = $(el).find('span[itemprop="ratingValue"]').text();
            obj['url'] = `${protocol}://${host}/${type}/${movieId}`;
            obj['year'] = $(el).find('span.year').text().trim();

            payload.push(obj);
        });


    return payload;
};
