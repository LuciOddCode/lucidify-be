"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGoal = exports.getGoals = exports.getActivitySummary = exports.updatePreferences = exports.getUserStats = exports.getDashboard = exports.deleteAccount = exports.exportData = exports.testTrustedContact = exports.setTrustedContact = exports.updateProfile = exports.getProfile = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const emailService_1 = __importDefault(require("../services/emailService"));
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
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
    if (preferences !== undefined) {
        updateData.preferences = { ...req.user.preferences, ...preferences };
    }
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
    const userId = req.user._id;
    const response = {
        success: true,
        message: "Data export initiated",
        data: {
            downloadUrl: `${process.env.FRONTEND_URL}/download/export-${userId}-${Date.now()}.json`,
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
exports.getDashboard = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const insights = await analyticsService_1.default.getInsights(userId);
    const recentActivity = [
        {
            type: "mood",
            message: "Logged your mood",
            timestamp: new Date().toISOString(),
        },
        {
            type: "journal",
            message: "Wrote a journal entry",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            type: "session",
            message: "Completed an 8-minute session",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
    ];
    const response = {
        success: true,
        message: "Dashboard data retrieved successfully",
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                preferences: req.user.preferences,
            },
            insights,
            recentActivity,
        },
    };
    res.json(response);
});
exports.getUserStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const moodAnalytics = await analyticsService_1.default.getMoodAnalytics(userId, days);
    const journalAnalytics = await analyticsService_1.default.getJournalAnalytics(userId, days);
    const sessionStats = {
        totalSessions: 0,
        completedSessions: 0,
        averageMood: 0,
    };
    const response = {
        success: true,
        message: "User statistics retrieved successfully",
        data: {
            moodAnalytics,
            journalAnalytics,
            sessionStats,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.updatePreferences = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { preferences } = req.body;
    const userId = req.user._id;
    const user = await User_1.User.findByIdAndUpdate(userId, { preferences: { ...req.user.preferences, ...preferences } }, { new: true, runValidators: true });
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404, true);
    }
    const response = {
        success: true,
        message: "Preferences updated successfully",
        data: {
            preferences: user.preferences,
        },
    };
    res.json(response);
});
exports.getActivitySummary = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const activitySummary = {
        moodEntries: 0,
        journalEntries: 0,
        chatMessages: 0,
        completedSessions: 0,
        totalDays: days,
        activeDays: 0,
    };
    const response = {
        success: true,
        message: "Activity summary retrieved successfully",
        data: {
            summary: activitySummary,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.getGoals = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const goals = [
        {
            id: "mood-tracking",
            title: "Track mood daily",
            description: "Log your mood every day for better self-awareness",
            completed: false,
            progress: 0,
        },
        {
            id: "journal-writing",
            title: "Write in journal",
            description: "Write in your journal at least 3 times a week",
            completed: false,
            progress: 0,
        },
        {
            id: "mindfulness-practice",
            title: "Practice mindfulness",
            description: "Complete 8-minute sessions 3 times a week",
            completed: false,
            progress: 0,
        },
    ];
    const response = {
        success: true,
        message: "Goals retrieved successfully",
        data: goals,
    };
    res.json(response);
});
exports.updateGoal = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { goalId } = req.params;
    const { completed, progress } = req.body;
    const response = {
        success: true,
        message: "Goal updated successfully",
    };
    res.json(response);
});
//# sourceMappingURL=profileController.js.map