import dotenv from 'dotenv';
import app, { setupApp } from "./app.js";
import { initDB, closeDB } from "./config/db.config.js";
import { initRedis, closeRedis } from "./config/redis.config.js";

dotenv.config({ path: '../.env' });

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        const dbPool = await initDB();
        const { client: redisClient } = await initRedis();

        await setupApp({ redisClient, dbPool });

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = async () => {
            console.log('\nGraceful shutdown initiated...');
            server.close();
            await closeRedis();
            await closeDB();
            process.exit(0);
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
}

bootstrap();