import { getDB } from "../config/db.config.js";
import { getLongUrl } from "../services/shortener.service.js";
import { recordClick } from "../services/analytics.service.js";
import { nanoid } from "nanoid";
import logger from "../utils/logger.utils.js";

const redirect = async (req, res) => {
  const { code } = req.params;

  try {
    const longUrl = await getLongUrl(code);
    
    if (!longUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    recordClick(req, code);
    console.log(`Redirecting code: ${code} to URL: ${longUrl}`);

    res.redirect(307, longUrl);
  } catch (error) {
    logger.error("redirect_error", { error: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const shorten = async (req, res) => {
  const { longUrl } = req.body;

  try {
    const pool = getDB();

    const existing = await pool.query(
      "SELECT code FROM short_urls WHERE long_url = $1",
      [longUrl]
    );

    if (existing.rows.length > 0) {
      return res.json({ shortUrl: `${process.env.BASE_URL}/${existing.rows[0].code}` });
    }

    const code = nanoid(5);

    await pool.query(
      "INSERT INTO short_urls (code, long_url) VALUES ($1,$2)",
      [code, longUrl]
    );

    res.json({ shortUrl: `${process.env.BASE_URL}/${code}` });
  }
  catch (error) {
    logger.error("shorten_error", { error: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { redirect, shorten };