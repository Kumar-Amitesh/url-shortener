import { Worker } from 'bullmq';
import { getDB } from './db.config.js';
import logger from '../utils/logger.utils.js';

export const initWorker = () => {
    const worker = new Worker('Clicks', async (job) => {
        const { code, ip, ua } = job.data;
        const pool = getDB();
        
        try {
            await pool.query(
                'INSERT INTO clicks (code, ip, user_agent) VALUES ($1, $2, $3)',
                [code, ip, ua]
            );
            console.log(`Click recorded for code: ${code} from IP: ${ip} with User-Agent: ${ua}`);
        } catch (err) {
            logger.error("Worker DB Insert Error", { error: err.message, jobData: job.data });
            throw err; // BullMQ will handle retries
        }
    }, {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD,
        }
    });

    worker.on('completed', (job) => logger.info(`Job ${job.id} completed: Click recorded for ${job.data.code}`));
    worker.on('failed', (job, err) => logger.error(`Job ${job.id} failed`, { error: err.message }));

    return worker;
};