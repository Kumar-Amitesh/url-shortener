import dotenv from 'dotenv';
import { initDB } from "./config/db.config.js";
import { initWorker } from "./config/redis.config.js";
import logger from "./utils/logger.utils.js";

dotenv.config({ path: '../.env' });

async function bootstrap() {
    try {
        await initDB();

        initWorker();
        console.log('BullMQ Click Worker Started');

    } catch (error) {
        logger.error("Worker Startup failed:", error);
        process.exit(1);
    }
}

bootstrap();