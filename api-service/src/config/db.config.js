import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "url_shortener",
    password: "22BCE2130",
    port: 5432,
})

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL
// })

export const connectDB = async () => {
    try{
        await pool.connect();
        console.log('Connected to PostgreSQL Database');
    }
    catch(err){
        console.error('Could not connect to PostgreSQL Database', err);
        process.exit(1);
    }
}

export default pool;