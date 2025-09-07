import express from "express";
import { authenticateToken } from "@/middleware/auth";
import { validate } from "@/middleware/validation";
import { authLimiter, registrationLimiter } from "@/middleware/rateLimiter";
import {
  register,
  login,
  googleAuth,
  verifyToken,
  logout,
  getProfile,
  updateProfile,
  setTrustedContact,
  testTrustedContact,
  exportData,
  deleteAccount,
} from "@/controllers/authController";
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  trustedContactSchema,
} from "@/middleware/validation";

const router = express.Router();

// Public routes
router.post(
  "/register",
  registrationLimiter,
  validate(registerSchema),
  register
);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google", authLimiter, googleAuth);

// Protected routes
router.get("/verify", authenticateToken, verifyToken);
router.post("/logout", authenticateToken, logout);
router.get("/profile", authenticateToken, getProfile);
router.put(
  "/profile",
  authenticateToken,
  validate(profileUpdateSchema),
  updateProfile
);
router.post(
  "/trusted-contact",
  authenticateToken,
  validate(trustedContactSchema),
  setTrustedContact
);
router.post("/trusted-contact/test", authenticateToken, testTrustedContact);
router.get("/export", authenticateToken, exportData);
router.delete("/account", authenticateToken, deleteAccount);

export default router;
