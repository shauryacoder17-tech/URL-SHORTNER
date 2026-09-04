import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
  resendVerificationCode,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendVerificationCode);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
