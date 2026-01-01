import pg from 'pg';
const { Pool } = pg;

let pool = null;

export const initDB = async () => {
    if (pool) return pool;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');
    return pool;
};

export const getDB = () => {
    if (!pool) throw new Error('DB not initialized');
    return pool;
};

export const closeDB = async () => {
    if (pool) {
        await pool.end();
        pool = null;
    }
};