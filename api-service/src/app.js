import express from "express";
import urlRoutes from "./routes/url.routes.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.utils.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import morgan from 'morgan';

const app = express();

export const setupApp = async ({ redisClient, dbPool }) => {
    const { RedisStore } = await import('rate-limit-redis');

    app.set("trust proxy", process.env.TRUST_PROXY === "true" ? true : (Number(process.env.TRUST_PROXY) || 1));

    app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
    app.use(cookieParser());
    app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));
    app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));

    app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

    const generalLimiter = rateLimit({ 
        windowMs: Number(process.env.RATE_WINDOW_MS) || 60 * 1000,
        max: Number(process.env.RATE_MAX) || 30,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        }),
        keyGenerator: (req) => `rate-limit-ip:${ipKeyGenerator(req).ip}`,
        skip: (req) => ['/health', '/metrics'].includes(req.path)
    });

    app.use(generalLimiter);
    app.use("/", urlRoutes);

    app.get('/health', async (req, res) => {
        try {
            await redisClient.ping();
            await dbPool.query('SELECT 1'); 
            res.json({ status: 'UP', services: { redis: 'UP', postgres: 'UP' } });
        } catch (err) {
            res.status(503).json({ status: 'DOWN', error: err.message });
        }
    });
};

export default app;