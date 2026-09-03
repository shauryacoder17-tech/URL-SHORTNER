import { Router } from "express";
import {
  shortenUrl,
  redirectToOriginal,
} from "../controllers/url.controller.js";

const router = Router();

router.post("/api/shorten", shortenUrl);
router.get("/:shortCode", redirectToOriginal);

export default router;
