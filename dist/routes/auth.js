"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const authController_1 = require("../controllers/authController");
const validation_2 = require("../middleware/validation");
const router = express_1.default.Router();
router.post("/register", rateLimiter_1.registrationLimiter, (0, validation_1.validate)(validation_2.registerSchema), authController_1.register);
router.post("/login", rateLimiter_1.authLimiter, (0, validation_1.validate)(validation_2.loginSchema), authController_1.login);
router.post("/google", rateLimiter_1.authLimiter, authController_1.googleAuth);
router.get("/verify", auth_1.authenticateToken, authController_1.verifyToken);
router.post("/logout", auth_1.authenticateToken, authController_1.logout);
router.get("/profile", auth_1.authenticateToken, authController_1.getProfile);
router.put("/profile", auth_1.authenticateToken, (0, validation_1.validate)(validation_2.profileUpdateSchema), authController_1.updateProfile);
router.post("/trusted-contact", auth_1.authenticateToken, (0, validation_1.validate)(validation_2.trustedContactSchema), authController_1.setTrustedContact);
router.post("/trusted-contact/test", auth_1.authenticateToken, authController_1.testTrustedContact);
router.get("/export", auth_1.authenticateToken, authController_1.exportData);
router.delete("/account", auth_1.authenticateToken, authController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=auth.js.map