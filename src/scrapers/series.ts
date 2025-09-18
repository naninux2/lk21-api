import cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { ISeasonsList, ISeries, ISeriesDetails } from '@/types';
import playwright from 'playwright';

/**
 * Scrape series asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<ISeries>} array of series objects
 */
export const scrapeSeries = async (
    req: Request,
    res: AxiosResponse
): Promise<ISeries[]> => {
    const $: cheerio.Root = cheerio.load(res.data);
    const payload: ISeries[] = [];
    const {
        headers: { host },
        protocol,
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

            const obj = {} as ISeries;

            obj['_id'] = movieId;
            obj['title'] =
                $(el).find('.poster-title').text() ?? '';
            obj['type'] = 'series';
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

    return payload;
};

/**
 * Scrape series details asynchronously
 * @param {Request} ExpressRequest
 * @param {AxiosResponse} AxiosResponse
 * @returns {Promise.<ISeriesDetails>} series details object
 */
export const scrapeSeriesDetails = async (
    req: Request,
    res: AxiosResponse
): Promise<ISeriesDetails> => {
    const { originalUrl } = req;

    const $: cheerio.Root = cheerio.load(res.data);
    const obj = {} as ISeriesDetails;

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
    obj['rating'] = $('div.info-tag').find('span > strong').text().trim();

    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    const fullUrl = process.env.ND_URL + originalUrl.replace("/series/", "")
    console.log("fullUrl", fullUrl);
    await page.goto(fullUrl, { waitUntil: 'networkidle' });
    const content = await page.content();
    const $$ = cheerio.load(content);

    // get all seasons from the dropdown
    const seasons: ISeasonsList[] = [];
    const seasonOptions: { season: number; value: string }[] = [];

    // First, collect all season options
    $$("select.season-select > option").each((i, el) => {
        const season = parseInt($$(el).attr('value')?.trim() || "1");
        const value = $$(el).attr('value')?.trim() || "1";
        seasonOptions.push({ season, value });
    });

    // Then, process each season sequentially
    for (const option of seasonOptions) {
        try {
            await page.selectOption('select.season-select', option.value);
            await page.waitForTimeout(1000); // wait for 1 second to load the episodes
            const newContent = await page.content();
            const $$$ = cheerio.load(newContent);
            // const totalEpisodes = $$$('ul.episode-list > li').length || 1;
            const episodes: { episode: number; title: string; url: string }[] = [];
            $$$('ul.episode-list > li').each((i, el) => {
                const episodeUrl = $$$(el).find('a').attr('href')?.split('/').reverse()[0];
                const episodeTitle = $$$(el).find('a').attr('title')?.trim() || `Episode ${i + 1}`;
                if (episodeUrl) {
                    episodes.push({ episode: i + 1, title: episodeTitle, url: `/episodes/${episodeUrl}` });
                }
            });
            seasons.push({
                season: option.season,
                // totalEpisodes,
                episodes,
            });
        } catch (error) {
            console.error(`Error processing season ${option.season}:`, error);
            // Add season with default episode count if there's an error
            seasons.push({
                season: option.season,
                episodes: [],
            });
        }
    }

    obj['seasons'] = seasons;

    // stop browser
    await browser.close();

    return obj;
};
