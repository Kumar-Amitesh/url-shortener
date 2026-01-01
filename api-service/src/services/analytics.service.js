import { getClickQueue } from "../config/redis.config.js";

function recordClick(req, code) {
  getClickQueue().add("click", {
    code,
    ip: req.ip,
    ua: req.headers["user-agent"]
  });
}

export { recordClick };
