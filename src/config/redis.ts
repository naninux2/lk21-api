import { createClient } from 'redis';

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('disconnect', () => {
    console.log('Disconnected from Redis');
});

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

export const disconnectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.disconnect();
        }
    } catch (error) {
        console.error('Failed to disconnect from Redis:', error);
    }
};