import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

export interface DynamicCorsOptions {
    defaultOrigins?: string[]; // Default allowed origins when no API key is present
    allowCredentials?: boolean;
    maxAge?: number;
    allowedHeaders?: string[];
    exposedHeaders?: string[];
}

export const dynamicCors = (options: DynamicCorsOptions = {}) => {
    const {
        defaultOrigins = ['*'],
        allowCredentials = false,
        maxAge = 86400,
        allowedHeaders = [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-API-Key'
        ],
        exposedHeaders = [
            'X-RateLimit-Daily-Limit',
            'X-RateLimit-Daily-Remaining',
            'X-RateLimit-Monthly-Limit',
            'X-RateLimit-Monthly-Remaining'
        ]
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin as string;
        let allowedOrigins: string[] = defaultOrigins;

        // If request has an authenticated API key with domain restrictions
        if (req.apiKey && req.apiKey.allowedDomains) {
            try {
                const apiKeyDomains = JSON.parse(req.apiKey.allowedDomains);
                allowedOrigins = apiKeyDomains;
            } catch (error) {
                console.error('Error parsing API key allowed domains:', error);
            }
        }

        // CORS configuration
        const corsOptions = {
            origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
                // Allow requests with no origin (mobile apps, Postman, curl, etc.)
                if (!origin) {
                    return callback(null, true);
                }

                // Check if origin is allowed
                const isAllowed = allowedOrigins.some(allowedOrigin => {
                    if (allowedOrigin === '*') return true;
                    if (allowedOrigin.startsWith('*.')) {
                        const domain = allowedOrigin.slice(2);
                        return origin.endsWith(domain);
                    }
                    return origin === allowedOrigin;
                });

                if (isAllowed) {
                    callback(null, true);
                } else {
                    callback(new Error(`Origin ${origin} not allowed by CORS policy`));
                }
            },
            credentials: allowCredentials,
            maxAge,
            allowedHeaders,
            exposedHeaders,
        };

        // Apply CORS with dynamic options
        cors(corsOptions)(req, res, next);
    };
};

// Standalone CORS error handler
export const corsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.message.includes('not allowed by CORS policy')) {
        return res.status(403).json({
            error: 'CORS policy violation',
            message: err.message,
            code: 'CORS_NOT_ALLOWED',
            hint: 'Contact API administrator to add your domain to the allowed origins list'
        });
    }
    next(err);
};