import express from "express";
import urlRoutes from "./routes/url.routes.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './utils/logger.utils.js';
import { RedisStore } from 'rate-limit-redis'
import { client as redisClient } from './config/redis.config.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import morgan from 'morgan';

dotenv.config({
    path:'../.env' 
});

const app = express();

if (process.env.TRUST_PROXY) {
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", true);
  else if (process.env.TRUST_PROXY === "false") app.set("trust proxy", false);
  else app.set("trust proxy", Number(process.env.TRUST_PROXY));
} else {
  app.set("trust proxy", 1);
}

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));

app.use(morgan('combined', { 
    stream: { write: (message) => logger.info(message.trim()) } 
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;

    const entry = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: duration,
      contentLength: res.getHeader("Content-Length") || 0,
    };
    if (res.statusCode >= 500) logger.error("request_finished", entry);
    else if (res.statusCode >= 400) logger.warn("request_finished", entry);
    else logger.info("request_finished", entry);
  });
  next();
});

const generalLimiter = rateLimit({ 
    windowMs: Number(process.env.RATE_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_MAX) || 30,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: 'draft-7', 
	legacyHeaders: false,
    keyGenerator: (req) => {
        console.log('IP Key Generator - Client IP:', ipKeyGenerator(req).ip);
        return `rate-limit-ip:${ipKeyGenerator(req).ip}`;
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }), 
    skip: (req) => {
        if (req.path === '/health') return true;
        if(req.path === '/metrics') return true;
        return false;
    }
});

app.use(generalLimiter);

app.use("/", urlRoutes);

app.get('/health', async (req, res) => {
    try {
        await redisClient.ping();

        await pool.query('SELECT 1'); 

        return res.status(200).json({ 
            status: 'UP', 
            services: { 
                redis: 'UP', 
                postgres: 'UP' 
            } 
        });
    } catch (err) {
        logger.error('Health check failed:', { message: err.message, stack: err.stack });
        
        return res.status(503).json({ 
            status: 'DOWN', 
            services: {
                redis: redisClient.isOpen ? 'UP' : 'DOWN',
                postgres: 'DOWN'
            },
            error: err.message 
        });
    }
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // logger.error(`[Error] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
    logger.error('unhandled_error', { statusCode, message: err.message, stack: err.stack });
    console.error(`[Error] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
    
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || []
    });
});

export default app;