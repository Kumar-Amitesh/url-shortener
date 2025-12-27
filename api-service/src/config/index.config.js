import pool from './db.config.js';
import { client as redisClient } from './redis.config.js';

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL Database');
    }
    catch (err) {
        console.error('Could not connect to PostgreSQL Database', err);
        process.exit(1);
    }
}

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    }
    catch (err) {
        console.error('Could not connect to Redis', err);
        process.exit(1);
    }
}

await connectDB();
await connectRedis();