import { getDB } from "../config/db.config.js";
import { getRedisClient} from "../config/redis.config.js";
import logger from "../utils/logger.utils.js";

async function getLongUrl(code) {
  try{
    const redisClient = getRedisClient();
    const cached = await redisClient.get(code);
    if (cached) return cached;

    const pool = getDB();

    const res = await pool.query(
      "SELECT long_url FROM short_urls WHERE code=$1",
      [code]
    );

    if (!res.rows.length) return null;

    await redisClient.set(code, res.rows[0].long_url,{ EX: 3600 }); // Cache for 1 hour
    return res.rows[0].long_url;
  }
  catch(err){
    logger.error("getLongUrl_error", { code, error: err });
    throw err;
  }
}

export { getLongUrl };
