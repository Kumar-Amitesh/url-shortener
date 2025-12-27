import pool from "../config/db.config.js";
import { getLongUrl } from "../services/shortener.service.js";
import { recordClick } from "../services/analytics.service.js";
import { nanoid } from "nanoid";

const redirect = async (req, res) => {
  const { code } = req.params;

  const longUrl = await getLongUrl(code);
  if (!longUrl) return res.status(404).send("Not found");

  recordClick(req, code);
  res.redirect(301, longUrl);
};

const shorten = async (req, res) => {
  const { longUrl } = req.body;

  const code = nanoid(8);

  await pool.query(
    "INSERT INTO short_urls (code, long_url) VALUES ($1,$2)",
    [code, longUrl]
  );

  res.json({ shortUrl: `${process.env.BASE_URL}/${code}` });
};

export { redirect, shorten };