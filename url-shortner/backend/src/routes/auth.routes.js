import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
  resendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
