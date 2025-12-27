import * as controller from "../controllers/url.controllers.js";
import { Router } from "express";

const router = Router();

router.post("/shorten", controller.shorten);
router.get("/:code", controller.redirect);

export default router;