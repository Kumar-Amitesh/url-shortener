import pool from "../config/db.config.js";
import { client as redisClient} from "../config/redis.config.js";

async function getLongUrl(code) {
  const cached = await redisClient.get(code);
  if (cached) return cached;

  const res = await pool.query(
    "SELECT long_url FROM short_urls WHERE code=$1",
    [code]
  );

  if (!res.rows.length) return null;

  await redisClient.set(code, res.rows[0].long_url,{ EX: 3600 }); // Cache for 1 hour
  return res.rows[0].long_url;
}

export { getLongUrl };
