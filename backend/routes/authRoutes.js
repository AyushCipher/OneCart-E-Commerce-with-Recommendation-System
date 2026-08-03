import express from "express";
import {
  registration,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  logOut,
  googleLogin,
  adminLogin
} from "../controller/authController.js";
import { loginLimiter, otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// USER AUTH
router.post("/register", registration);
router.post("/login", loginLimiter, login);
router.post("/googlelogin", googleLogin);
router.post("/adminlogin", loginLimiter, adminLogin);

// OTP FLOW
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/reset-password", resetPassword);

// LOGOUT
router.post("/logout", logOut);

export default router;
