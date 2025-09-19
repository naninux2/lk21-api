import { Request, Response, NextFunction } from 'express';
import { ApiKeyService, ApiKeyValidationResult } from '../db/services/ApiKeyService';

interface AuthenticatedRequest extends Request {
    apiKey?: any;
    remainingDailyRequests?: number;
    remainingMonthlyRequests?: number;
    requestStartTime?: number;
}

export interface ApiKeyMiddlewareOptions {
    required?: boolean; // If false, allows requests without API keys but still validates if provided
    skipRoutes?: string[]; // Routes to skip authentication (e.g., health checks)
    skipMethods?: string[]; // HTTP methods to skip (e.g., ['OPTIONS'])
}

export const apiKeyAuth = (options: ApiKeyMiddlewareOptions = {}) => {
    const { required = true, skipRoutes = [], skipMethods = ['OPTIONS'] } = options;

    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Skip authentication for certain routes
            const shouldSkip = skipRoutes.some(route => {
                if (route.endsWith('*')) {
                    return req.path.startsWith(route.slice(0, -1));
                }
                return req.path === route || req.path.startsWith(route + '/');
            });

            if (shouldSkip || skipMethods.includes(req.method)) {
                return next();
            }

            // Get API key from header (X-API-Key), Authorization Bearer, or query parameter
            let apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;

            // Check Authorization header for Bearer token
            if (!apiKey) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    apiKey = authHeader.substring(7);
                }
            }

            // If no API key provided
            if (!apiKey) {
                if (!required) {
                    return next(); // Allow access without API key if not required
                }

                return res.status(401).json({
                    error: 'API key required',
                    message: 'Please provide an API key via X-API-Key header, Authorization Bearer token, or apiKey query parameter',
                    code: 'MISSING_API_KEY'
                });
            }            // Get client information
            const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
            const origin = req.headers.origin as string;
            const userAgent = req.headers['user-agent'] as string;
            const referer = req.headers.referer as string;

            // Validate API key
            const validation: ApiKeyValidationResult = await ApiKeyService.validateApiKey(apiKey, ipAddress, origin);

            if (!validation.isValid) {
                return res.status(403).json({
                    error: 'Invalid API key',
                    message: validation.reason,
                    code: 'INVALID_API_KEY'
                });
            }

            // Store API key info in request for later use
            req.apiKey = validation.apiKey;
            req.remainingDailyRequests = validation.remainingDailyRequests;
            req.remainingMonthlyRequests = validation.remainingMonthlyRequests;

            // Add usage headers to response
            res.set({
                'X-RateLimit-Daily-Limit': validation.apiKey!.dailyLimit?.toString() || 'unlimited',
                'X-RateLimit-Daily-Remaining': validation.remainingDailyRequests?.toString() || 'unlimited',
                'X-RateLimit-Monthly-Limit': validation.apiKey!.monthlyLimit?.toString() || 'unlimited',
                'X-RateLimit-Monthly-Remaining': validation.remainingMonthlyRequests?.toString() || 'unlimited',
            });

            // Store request start time for response time calculation
            const requestStartTime = Date.now();
            req.requestStartTime = requestStartTime;

            // Increment usage count
            await ApiKeyService.incrementUsage(validation.apiKey!.keyId, ipAddress);

            // Log the request (async, don't wait)
            setImmediate(async () => {
                try {
                    const responseTime = Date.now() - requestStartTime;
                    await ApiKeyService.logRequest({
                        keyId: validation.apiKey!.keyId,
                        endpoint: req.path,
                        method: req.method,
                        statusCode: res.statusCode,
                        responseTime,
                        userAgent,
                        ipAddress,
                        referer,
                        requestSize: parseInt(req.headers['content-length'] as string) || 0,
                    });
                } catch (error) {
                    console.error('Error logging API request:', error);
                }
            });

            next();
        } catch (error) {
            console.error('API key authentication error:', error);
            res.status(500).json({
                error: 'Authentication error',
                message: 'Internal server error during authentication',
                code: 'AUTH_ERROR'
            });
        }
    };
};

// Middleware to log response size after response is sent
export const apiKeyResponseLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
        return next();
    }

    const originalSend = res.send;
    const originalJson = res.json;

    // Override send method
    res.send = function (body: any) {
        res.locals.responseSize = Buffer.byteLength(body || '', 'utf8');
        return originalSend.call(this, body);
    };

    // Override json method
    res.json = function (body: any) {
        res.locals.responseSize = Buffer.byteLength(JSON.stringify(body || {}), 'utf8');
        return originalJson.call(this, body);
    };

    next();
};

// Type declaration for extended Request
declare global {
    namespace Express {
        interface Request {
            apiKey?: any;
            remainingDailyRequests?: number;
            remainingMonthlyRequests?: number;
            requestStartTime?: number;
        }
    }
}