"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.exportData = exports.testTrustedContact = exports.setTrustedContact = exports.updateProfile = exports.getProfile = exports.logout = exports.verifyToken = exports.googleAuth = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const emailService_1 = __importDefault(require("../services/emailService"));
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const validation = (0, validation_1.validateSignupData)({ email, password, confirmPassword });
    if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new errorHandler_1.CustomError(firstError, 400, true);
    }
    const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new errorHandler_1.CustomError("Email already exists", 409, true);
    }
    const user = new User_1.User({
        email: email.toLowerCase(),
        password: password,
        name: "User",
        preferences: {
            language: "en",
            aiSummarization: true,
            anonymousMode: false,
            dataConsent: true,
        },
    });
    await user.save();
    const token = (0, auth_1.generateToken)(user._id.toString(), user.email);
    try {
        await emailService_1.default.sendWelcomeEmail(user.email, user.name || "User", user.preferences.language);
    }
    catch (error) {
        console.error("Error sending welcome email:", error);
    }
    const response = {
        success: true,
        message: "Account created successfully",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
                createdAt: user.createdAt.toISOString(),
            },
            token,
        },
    };
    res.status(201).json(response);
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
        throw new errorHandler_1.CustomError("Invalid email or password", 401, true);
    }
    if (!user.password) {
        throw new errorHandler_1.CustomError("Please use Google sign-in for this account", 401, true);
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new errorHandler_1.CustomError("Invalid email or password", 401, true);
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = (0, auth_1.generateToken)(user._id.toString(), user.email);
    const response = {
        success: true,
        message: "Login successful",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
                lastLoginAt: user.lastLoginAt?.toISOString(),
            },
            token,
        },
    };
    res.json(response);
});
exports.googleAuth = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { googleId, email, firstName, lastName, avatar } = req.body;
    if (!googleId || !email || !firstName || !lastName) {
        throw new errorHandler_1.CustomError("Google authentication data is incomplete", 400, true);
    }
    let user = await User_1.User.findOne({
        $or: [{ googleId: googleId }, { email: email.toLowerCase() }],
    });
    if (user) {
        if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = avatar || user.avatar;
            await user.save();
        }
    }
    else {
        user = new User_1.User({
            googleId: googleId,
            email: email.toLowerCase(),
            name: `${firstName} ${lastName}`,
            avatar: avatar,
            preferences: {
                language: "en",
                aiSummarization: true,
                anonymousMode: false,
                dataConsent: true,
            },
        });
        await user.save();
        try {
            await emailService_1.default.sendWelcomeEmail(user.email, user.name || "User", user.preferences.language);
        }
        catch (error) {
            console.error("Error sending welcome email:", error);
        }
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = (0, auth_1.generateToken)(user._id.toString(), user.email);
    const response = {
        success: true,
        message: "Google authentication successful",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
                lastLoginAt: user.lastLoginAt?.toISOString(),
            },
            token,
        },
    };
    res.json(response);
});
exports.verifyToken = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const response = {
        success: true,
        message: "Token is valid",
        data: {
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                preferences: req.user.preferences,
                lastLoginAt: req.user.lastLoginAt?.toISOString(),
            },
        },
    };
    res.json(response);
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const response = {
        success: true,
        message: "Logout successful",
    };
    res.json(response);
});
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const response = {
        success: true,
        message: "Profile retrieved successfully",
        data: {
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                preferences: req.user.preferences,
                createdAt: req.user.createdAt.toISOString(),
                lastLoginAt: req.user.lastLoginAt?.toISOString(),
            },
        },
    };
    res.json(response);
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, preferences } = req.body;
    const userId = req.user._id;
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (preferences !== undefined)
        updateData.preferences = { ...req.user.preferences, ...preferences };
    const user = await User_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404, true);
    }
    const response = {
        success: true,
        message: "Profile updated successfully",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
                createdAt: user.createdAt.toISOString(),
                lastLoginAt: user.lastLoginAt?.toISOString(),
            },
        },
    };
    res.json(response);
});
exports.setTrustedContact = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, email, phone } = req.body;
    const userId = req.user._id;
    const user = await User_1.User.findByIdAndUpdate(userId, {
        "preferences.trustedContact": {
            name,
            email,
            phone,
        },
    }, { new: true, runValidators: true });
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404, true);
    }
    const response = {
        success: true,
        message: "Trusted contact set successfully",
    };
    res.json(response);
});
exports.testTrustedContact = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = req.user;
    if (!user.preferences.trustedContact) {
        throw new errorHandler_1.CustomError("No trusted contact set", 400, true);
    }
    const { name, email } = user.preferences.trustedContact;
    const message = `This is a test message from ${user.name || user.email} to verify the trusted contact feature.`;
    const emailSent = await emailService_1.default.sendTrustedContactNotification(email, user.name || user.email, message, user.preferences.language);
    if (!emailSent) {
        throw new errorHandler_1.CustomError("Failed to send test email", 500, true);
    }
    const response = {
        success: true,
        message: "Test email sent successfully to trusted contact",
    };
    res.json(response);
});
exports.exportData = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const response = {
        success: true,
        message: "Data export initiated",
        data: {
            downloadUrl: `${process.env.FRONTEND_URL}/download/export-${Date.now()}.json`,
        },
    };
    res.json(response);
});
exports.deleteAccount = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    await User_1.User.findByIdAndDelete(userId);
    const response = {
        success: true,
        message: "Account deleted successfully",
    };
    res.json(response);
});
//# sourceMappingURL=authController.js.map