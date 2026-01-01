import redis from 'redis';
import { Queue } from 'bullmq';

let client = null;
let clickQueue = null;

export const initRedis = async () => {
    if (client) return { client, clickQueue };

    client = redis.createClient({
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    
    await client.connect();
    console.log('Redis connected');

    clickQueue = new Queue('Clicks', {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD,
        }
    });
    console.log('BullMQ Job Queue Created');

    return { client, clickQueue };
};

export const getRedisClient = () => {
    if (!client) throw new Error('Redis not initialized');
    return client;
};

export const getClickQueue = () => {
    if (!clickQueue) throw new Error('ClickQueue not initialized');
    return clickQueue;
};

export const closeRedis = async () => {
    if (client) {
        await client.quit();
        client = null;
    }
};