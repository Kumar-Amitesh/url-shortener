import { clickQueue } from "../config/redis.config.js";

function recordClick(req, code) {
  clickQueue.add("click", {
    code,
    ip: req.ip,
    ua: req.headers["user-agent"]
  });
}

export { recordClick };
