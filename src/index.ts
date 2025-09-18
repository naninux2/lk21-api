import 'module-alias/register';
import server from '@/server';
import { disconnectRedis } from '@/config/redis';

const port: number = Number(process.env.PORT) || 8080;

const app = server.listen(port, () => {
    console.log(`[${port}] server running`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully');

    // Close the server
    app.close(() => {
        console.log('HTTP server closed');
    });

    // Disconnect from Redis
    await disconnectRedis();

    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully');

    // Close the server
    app.close(() => {
        console.log('HTTP server closed');
    });

    // Disconnect from Redis
    await disconnectRedis();

    process.exit(0);
});
