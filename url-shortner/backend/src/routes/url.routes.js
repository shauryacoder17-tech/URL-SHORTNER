import { Router } from "express";
import {
  shortenUrl,
  redirectToOriginal,
} from "../controllers/url.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/api/shorten", authenticateToken, shortenUrl);
router.get("/:shortCode", redirectToOriginal);

export default router;
