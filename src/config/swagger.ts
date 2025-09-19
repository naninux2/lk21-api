import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LK21 API',
            version: '1.0.0',
            description: `
# LK21 API Documentation

Unofficial LK21 (LayarKaca21) and NontonDrama APIs for streaming movies, animations, and series with Indonesian subtitles.

## 🔐 Authentication Required

All API endpoints require authentication using an API key. To get started:

1. **Get API Key**: Contact administrator or use CLI to generate API key
2. **Authenticate**: Click the **🔒 Authorize** button above and enter your API key
3. **Use API**: All requests will include your API key automatically

### Authentication Methods:
- **X-API-Key Header**: \`X-API-Key: your_api_key_here\`
- **Authorization Bearer**: \`Authorization: Bearer your_api_key_here\`
- **Query Parameter**: \`?apiKey=your_api_key_here\`

### Rate Limits:
- Daily limit: Usually 1,000 requests per day
- Monthly limit: Usually 30,000 requests per month
- Check response headers for current usage: \`X-RateLimit-Daily-Remaining\`

## Features
- 🎬 **Movies & Series**: Latest, popular, and top-rated content
- 🔍 **Search**: Find movies and series by title
- 🏷️ **Categories**: Browse by genre, country, and release year
- 📺 **Streaming**: Get streaming sources and episode details
- ⚡ **Caching**: Redis-powered caching for better performance
- 🛠️ **Cache Management**: Built-in cache control endpoints

## Base URL
\`${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:8080'}\`

## Sources
- **LK21**: ${process.env.LK21_URL || 'https://tv15.lk21official.my'}
- **NontonDrama**: ${process.env.ND_URL || 'https://tv14.nontondrama.click'}
            `,
            contact: {
                name: 'GitHub Repository',
                url: 'https://github.com/febriadj/lk21-api'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-domain.com'
                    : 'http://localhost:8080',
                description: process.env.NODE_ENV === 'production'
                    ? 'Production server'
                    : 'Development server'
            }
        ],
        tags: [
            {
                name: 'Movies',
                description: 'Movie-related endpoints'
            },
            {
                name: 'Series',
                description: 'TV series-related endpoints'
            },
            {
                name: 'Search',
                description: 'Search functionality'
            },
            {
                name: 'Categories',
                description: 'Genre, country, and year categories'
            },
            {
                name: 'Streaming',
                description: 'Streaming sources and downloads'
            },
            {
                name: 'Cache Management',
                description: 'Cache control and statistics'
            },
            {
                name: 'System',
                description: 'System information and health checks'
            }
        ],
        security: [
            {
                ApiKeyAuth: []
            },
            {
                BearerAuth: []
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API Key required for accessing protected endpoints'
                },
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'API-Key',
                    description: 'Bearer token using your API key'
                }
            },
            schemas: {
                Movie: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique movie identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Movie title'
                        },
                        type: {
                            type: 'string',
                            enum: ['movie'],
                            description: 'Content type'
                        },
                        posterImg: {
                            type: 'string',
                            format: 'uri',
                            description: 'Movie poster image URL'
                        },
                        rating: {
                            type: 'string',
                            description: 'Movie rating'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Movie detail URL'
                        },
                        qualityResolution: {
                            type: 'string',
                            description: 'Video quality (e.g., HD, CAM)'
                        },
                        genres: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    url: { type: 'string', format: 'uri' }
                                }
                            }
                        },
                        duration: {
                            type: 'string',
                            description: 'Movie duration'
                        },
                        year: {
                            type: 'string',
                            description: 'Release year'
                        }
                    },
                    example: {
                        _id: 'avatar-the-way-of-water-2022',
                        title: 'Avatar: The Way of Water',
                        type: 'movie',
                        posterImg: 'https://example.com/poster.jpg',
                        rating: '8.1',
                        url: 'http://localhost:8080/movies/avatar-the-way-of-water-2022',
                        qualityResolution: 'HD',
                        genres: [
                            { name: 'Action', url: 'http://localhost:8080/genres/action' },
                            { name: 'Sci-Fi', url: 'http://localhost:8080/genres/sci-fi' }
                        ],
                        duration: '3h 12m',
                        year: '2022'
                    }
                },
                MovieDetails: {
                    allOf: [
                        { $ref: '#/components/schemas/Movie' },
                        {
                            type: 'object',
                            properties: {
                                synopsis: {
                                    type: 'string',
                                    description: 'Movie synopsis'
                                },
                                trailerUrl: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'Trailer video URL'
                                },
                                releaseDate: {
                                    type: 'string',
                                    description: 'Release date'
                                },
                                directors: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            url: { type: 'string', format: 'uri' }
                                        }
                                    }
                                },
                                casts: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            url: { type: 'string', format: 'uri' }
                                        }
                                    }
                                },
                                countries: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            url: { type: 'string', format: 'uri' }
                                        }
                                    }
                                },
                                streaming_url: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            provider: { type: 'string' },
                                            url: { type: 'string', format: 'uri' }
                                        }
                                    }
                                },
                                download_url: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'Download URL'
                                }
                            }
                        }
                    ]
                },
                Series: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique series identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Series title'
                        },
                        type: {
                            type: 'string',
                            enum: ['series'],
                            description: 'Content type'
                        },
                        posterImg: {
                            type: 'string',
                            format: 'uri',
                            description: 'Series poster image URL'
                        },
                        rating: {
                            type: 'string',
                            description: 'Series rating'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Series detail URL'
                        },
                        qualityResolution: {
                            type: 'string',
                            description: 'Video quality'
                        },
                        genres: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    url: { type: 'string', format: 'uri' }
                                }
                            }
                        },
                        duration: {
                            type: 'string',
                            description: 'Episode duration'
                        },
                        year: {
                            type: 'string',
                            description: 'Release year'
                        }
                    }
                },
                SeriesDetails: {
                    allOf: [
                        { $ref: '#/components/schemas/Series' },
                        {
                            type: 'object',
                            properties: {
                                synopsis: {
                                    type: 'string',
                                    description: 'Series synopsis'
                                },
                                seasons: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            season: { type: 'integer' },
                                            episodes: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        episode: { type: 'integer' },
                                                        title: { type: 'string' },
                                                        url: { type: 'string', format: 'uri' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                Genre: {
                    type: 'object',
                    properties: {
                        parameter: {
                            type: 'string',
                            description: 'Genre parameter for URL'
                        },
                        numberOfContents: {
                            type: 'integer',
                            description: 'Number of contents in this genre'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Genre page URL'
                        }
                    }
                },
                Country: {
                    type: 'object',
                    properties: {
                        parameter: {
                            type: 'string',
                            description: 'Country parameter for URL'
                        },
                        numberOfContents: {
                            type: 'integer',
                            description: 'Number of contents from this country'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Country page URL'
                        }
                    }
                },
                Year: {
                    type: 'object',
                    properties: {
                        parameter: {
                            type: 'string',
                            description: 'Year parameter for URL'
                        },
                        numberOfContents: {
                            type: 'integer',
                            description: 'Number of contents from this year'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Year page URL'
                        }
                    }
                },
                CacheStats: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Request success status'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                totalKeys: {
                                    type: 'integer',
                                    description: 'Total number of cache keys'
                                },
                                keys: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'List of all cache keys'
                                }
                            }
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation completed successfully'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'An error occurred'
                        },
                        error: {
                            type: 'string',
                            example: 'Detailed error message'
                        }
                    }
                }
            },
            parameters: {
                PageQuery: {
                    in: 'query',
                    name: 'page',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1
                    },
                    description: 'Page number for pagination'
                },
                MovieId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'Movie ID',
                    example: 'avatar-the-way-of-water-2022'
                },
                SeriesId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'Series ID',
                    example: 'wednesday-2022'
                },
                EpisodeId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'Episode ID',
                    example: 'wednesday-2022-episode-1'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    // Swagger page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customSiteTitle: 'LK21 API Documentation',
        customCss: `
            .topbar-wrapper img { content: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjIiIHk9IjMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNCIgcng9IjIiIHJ5PSIyIi8+PGxpbmUgeDE9IjgiIHkxPSIyMSIgeDI9IjE2IiB5Mj0iMjEiLz48bGluZSB4MT0iMTIiIHkxPSIxNyIgeDI9IjEyIiB5Mj0iMjEiLz48L3N2Zz4='); width: auto; height: 40px; }
            .swagger-ui .topbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .swagger-ui .info .title { color: #363636; }
        `,
        customJs: [
            `console.log('LK21 API Documentation loaded');`
        ],
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            defaultModelsExpandDepth: 2
        }
    }));

    // Swagger JSON
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

export default specs;