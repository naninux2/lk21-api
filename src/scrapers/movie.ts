import { Request, response } from 'express';
import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { IMovies, IMovieDetails, PaginationResponse } from '@/types';

/**
 * Scrape movies asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<IMovies[]>} array of movies objects
 */
export const scrapeMovies = async (
    req: Request,
    res: AxiosResponse
): Promise<PaginationResponse<IMovies>> => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: IMovies[] = [];
    const {
        protocol,
        headers: { host },
    } = req;

    $('main > div.main-section > div.container > div.widget')
        .find('div.gallery-grid > article')
        .each((i, el) => {
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

            const obj = {} as IMovies;

            obj['_id'] = movieId;
            obj['title'] =
                $(el).find('.poster-title').text() ?? '';
            obj['type'] = 'movie';
            obj['posterImg'] = `${$(el)
                .find('picture > img')
                .attr('src')}`;
            obj['rating'] = $(el).find('span[itemprop="ratingValue"]').text();
            obj['url'] = `${protocol}://${host}/movies/${movieId}`;
            obj['qualityResolution'] = $(el)
                .find('.label.label-HD')
                .text();
            obj['genres'] = genres;
            obj['duration'] = $(el)
                .find('span[itemprop="duration"]')
                .text();
            obj['year'] = $(el).find('span.year').text().trim();

            payload.push(obj);
        });

    const totalPages = $("body > main > div.main-section > div > nav > nav > ul > li:nth-child(4) > a").attr('href')?.split('/').reverse()[0] ?? '';

    const responseData: PaginationResponse<IMovies> = {
        items: payload,
        total_page: parseInt(totalPages) || 1,
        total_items: payload.length,
        offset: 0,
        limit: payload.length,
        page: parseInt(req.query.page as string) || 1,
        next_page:
            (parseInt(req.query.page as string) || 1) + 1 >
                parseInt(totalPages)
                ? undefined
                : (parseInt(req.query.page as string) || 1) + 1,
        prev_page:
            (parseInt(req.query.page as string) || 1) - 1 < 1
                ? undefined
                : (parseInt(req.query.page as string) || 1) - 1,
    }

    return responseData
};

/**
 * Scrape movie details asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<IMovieDetails>} movie details object
 */
export const scrapeMovieDetails = async (
    req: Request,
    res: AxiosResponse
): Promise<IMovieDetails> => {
    const { originalUrl } = req;

    const $: cheerio.Root = cheerio.load(res.data);
    const obj = {} as IMovieDetails;

    const genres: { name: string, url: string }[] = [];
    const directors: { name: string, url: string }[] = [];
    const countries: { name: string, url: string }[] = [];
    const casts: { name: string, url: string }[] = [];
    const streaming_url: { provider: string; url: string }[] = [];

    $('div.content').find('blockquote').find('strong').remove();

    obj['_id'] = originalUrl.split('/').reverse()[0];
    obj['title'] =
        $('.movie-info').find('h1').text().replace("Nonton ", "").replace(" Sub Indo di Lk21", "") ??
        '';
    obj['type'] = 'movie';
    obj['posterImg'] = `${$('meta[property="og:image"]').attr('content')}`;

    $('.tag-list').find(".tag").each((i, el) => {
        const href = $(el).find('a').attr('href');
        if (href?.includes('/genre/')) {
            const genreUrl = href.split('/').reverse()[0];
            genres.push({ name: $(el).text().trim(), url: `/genres/${genreUrl}` });
        }

        if (href?.includes('/country/')) {
            const countryUrl = href.split('/').reverse()[0];
            countries.push({ name: $(el).text().trim(), url: `/countries/${countryUrl}` });
        }
    });

    $('.detail').find("p").each((i, el) => {
        const spanText = $(el).find('span').text().toLowerCase().replace(":", "").trim();
        switch (spanText) {
            case 'release':
                obj['releaseDate'] = $(el).text().trim().replace('Release:', '').trim();
                break;
            case 'sutradara':
                $(el)
                    .find('a')
                    .each((i, directorEl) => {
                        const directorUrl = $(directorEl).attr('href')?.split('/').reverse()[0];
                        if (directorUrl) {
                            directors.push({ name: $(directorEl).text().trim(), url: `/directors/${directorUrl}` });
                        }
                    });
                break;
            case 'bintang film':
                console.log("masuk bintang film");
                $(el)
                    .find('a')
                    .each((i, castEl) => {
                        const castUrl = $(castEl).attr('href')?.split('/').reverse()[0];
                        if (castUrl) {
                            casts.push({ name: $(castEl).text().trim(), url: `/actors/${castUrl}` });
                        }
                    });
                break;
            default:
                break;
        }
        /* eslint-enable */
    });

    $("#player-list").find('li').each((i, el) => {
        const provider = $(el).text().trim();
        const url = $(el).find('a').attr('data-url');
        if (url) {
            streaming_url.push({ provider, url });
        }
    });

    obj['synopsis'] = $('.synopsis.collapsed').text().trim();
    obj['trailerUrl'] =
        $('a.yt-lightbox').attr('href') ?? '';
    obj['genres'] = genres;
    obj['directors'] = directors;
    obj['countries'] = countries;
    obj['casts'] = casts;
    obj['streaming_url'] = streaming_url;
    obj['rating'] = $('div.info-tag').find('span > strong').text().trim();
    obj['download_url'] = `https://dl.lk21.party/get/${obj['_id']}`;
    return obj;
};
