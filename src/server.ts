import dotenv from 'dotenv';

dotenv.config();

import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from '@/routes';
import { connectRedis } from '@/config/redis';
import { setupSwagger } from '@/config/swagger';

const app: Application = express();

// Connect to Redis
connectRedis().catch(err => {
    console.error('Failed to connect to Redis on startup:', err);
});

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors({ origin: '*' }));

// Setup Swagger documentation
setupSwagger(app);

app.use(routes);

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
    });
});

export default app;
