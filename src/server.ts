import dotenv from 'dotenv';

dotenv.config();

import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from '@/routes';
import { connectRedis } from '@/config/redis';
import { setupSwagger } from '@/config/swagger';
import { testDbConnection } from '@/db';
import { apiKeyAuth, apiKeyResponseLogger } from '@/middleware/apiKeyAuth';
import { dynamicCors, corsErrorHandler } from '@/middleware/dynamicCors';

const app: Application = express();

// Connect to Redis
connectRedis().catch(err => {
    console.error('Failed to connect to Redis on startup:', err);
});

// Test database connection
testDbConnection().catch(err => {
    console.error('Failed to connect to database on startup:', err);
});

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'));

// API Key authentication (required for all API endpoints)
app.use(apiKeyAuth({
    required: true,
    skipRoutes: ['/', '/docs*', '/health', '/favicon.ico'],
    skipMethods: ['OPTIONS']
}));

// Response logging for API key usage
app.use(apiKeyResponseLogger);

// Dynamic CORS based on API key allowed domains
app.use(dynamicCors({
    defaultOrigins: ['*'], // Allow all origins when no API key restrictions
    allowCredentials: false,
    exposedHeaders: [
        'X-RateLimit-Daily-Limit',
        'X-RateLimit-Daily-Remaining',
        'X-RateLimit-Monthly-Limit',
        'X-RateLimit-Monthly-Remaining'
    ]
}));

// CORS error handler
app.use(corsErrorHandler);

// Setup Swagger documentation
setupSwagger(app);

app.use(routes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check API health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Get basic information about the LK21 API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unofficial LK21 (LayarKaca21) and NontonDrama APIs"
 *                 documentation:
 *                   type: string
 *                   format: uri
 *                   example: "http://localhost:8080/docs"
 *                 data:
 *                   type: object
 *                   properties:
 *                     LK21_URL:
 *                       type: string
 *                       format: uri
 *                       example: "https://tv15.lk21official.my"
 *                     ND_URL:
 *                       type: string
 *                       format: uri
 *                       example: "https://tv14.nontondrama.click"
 */
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Unofficial LK21 (LayarKaca21) and NontonDrama APIs',
        documentation: `${req.protocol}://${req.get('host')}/docs`,
        data: {
            LK21_URL: process.env.LK21_URL,
            ND_URL: process.env.ND_URL,
        },
        apiKey: {
            provided: !!req.apiKey,
            keyId: req.apiKey?.keyId,
            dailyUsage: req.apiKey ? `${req.apiKey.dailyUsage || 0}/${req.apiKey.dailyLimit || '∞'}` : null,
            monthlyUsage: req.apiKey ? `${req.apiKey.monthlyUsage || 0}/${req.apiKey.monthlyLimit || '∞'}` : null
        }
    });
});

export default app;
