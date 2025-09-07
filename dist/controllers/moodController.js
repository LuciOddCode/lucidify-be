"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmotionFrequency = exports.getMoodTrends = exports.getMoodInsights = exports.deleteMoodEntry = exports.updateMoodEntry = exports.getMoodEntry = exports.getMoodAnalytics = exports.getMoodEntries = exports.logMood = void 0;
const MoodEntry_1 = require("../models/MoodEntry");
const errorHandler_1 = require("../middleware/errorHandler");
const geminiService_1 = __importDefault(require("../services/geminiService"));
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
exports.logMood = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { mood, emotions, notes, voiceTranscript } = req.body;
    const userId = req.user._id;
    let sentiment = {
        score: 0,
        label: "neutral",
        confidence: 0.5,
    };
    if (notes || voiceTranscript) {
        const textToAnalyze = notes || voiceTranscript || "";
        sentiment = await geminiService_1.default.analyzeSentiment(textToAnalyze);
    }
    const moodEntry = new MoodEntry_1.MoodEntry({
        userId,
        mood,
        emotions: emotions || [],
        notes,
        voiceTranscript,
        sentiment,
    });
    await moodEntry.save();
    const response = {
        success: true,
        message: "Mood logged successfully",
        data: moodEntry,
    };
    res.status(201).json(response);
});
exports.getMoodEntries = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await MoodEntry_1.MoodEntry.countDocuments({ userId });
    const moodEntries = await MoodEntry_1.MoodEntry.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Mood entries retrieved successfully",
        data: moodEntries,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getMoodAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const analytics = await analyticsService_1.default.getMoodAnalytics(userId, days);
    const response = {
        success: true,
        message: "Mood analytics retrieved successfully",
        data: analytics,
    };
    res.json(response);
});
exports.getMoodEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const moodEntry = await MoodEntry_1.MoodEntry.findOne({ _id: id, userId });
    if (!moodEntry) {
        throw new errorHandler_1.CustomError("Mood entry not found", 404, true);
    }
    const response = {
        success: true,
        message: "Mood entry retrieved successfully",
        data: moodEntry,
    };
    res.json(response);
});
exports.updateMoodEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { mood, emotions, notes, voiceTranscript } = req.body;
    const moodEntry = await MoodEntry_1.MoodEntry.findOne({ _id: id, userId });
    if (!moodEntry) {
        throw new errorHandler_1.CustomError("Mood entry not found", 404, true);
    }
    if (mood !== undefined)
        moodEntry.mood = mood;
    if (emotions !== undefined)
        moodEntry.emotions = emotions;
    if (notes !== undefined)
        moodEntry.notes = notes;
    if (voiceTranscript !== undefined)
        moodEntry.voiceTranscript = voiceTranscript;
    if (notes !== undefined || voiceTranscript !== undefined) {
        const textToAnalyze = moodEntry.notes || moodEntry.voiceTranscript || "";
        if (textToAnalyze) {
            moodEntry.sentiment = await geminiService_1.default.analyzeSentiment(textToAnalyze);
        }
    }
    await moodEntry.save();
    const response = {
        success: true,
        message: "Mood entry updated successfully",
        data: moodEntry,
    };
    res.json(response);
});
exports.deleteMoodEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const moodEntry = await MoodEntry_1.MoodEntry.findOneAndDelete({ _id: id, userId });
    if (!moodEntry) {
        throw new errorHandler_1.CustomError("Mood entry not found", 404, true);
    }
    const response = {
        success: true,
        message: "Mood entry deleted successfully",
    };
    res.json(response);
});
exports.getMoodInsights = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const insights = await analyticsService_1.default.getInsights(userId);
    const response = {
        success: true,
        message: "Mood insights retrieved successfully",
        data: {
            moodInsights: insights.moodInsights,
            recommendations: insights.recommendations,
        },
    };
    res.json(response);
});
exports.getMoodTrends = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const moodEntries = await MoodEntry_1.MoodEntry.find({
        userId,
        timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });
    const dailyAverages = {};
    moodEntries.forEach((entry) => {
        const date = entry.timestamp.toISOString().split("T")[0];
        if (!dailyAverages[date]) {
            dailyAverages[date] = { mood: 0, count: 0 };
        }
        dailyAverages[date].mood += entry.mood;
        dailyAverages[date].count += 1;
    });
    const trends = Object.entries(dailyAverages).map(([date, data]) => ({
        date,
        averageMood: Math.round((data.mood / data.count) * 10) / 10,
        entryCount: data.count,
    }));
    const response = {
        success: true,
        message: "Mood trends retrieved successfully",
        data: {
            trends,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.getEmotionFrequency = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const moodEntries = await MoodEntry_1.MoodEntry.find({
        userId,
        timestamp: { $gte: startDate },
    });
    const emotionCount = {};
    moodEntries.forEach((entry) => {
        entry.emotions.forEach((emotion) => {
            emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
    });
    const frequency = Object.entries(emotionCount)
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count);
    const response = {
        success: true,
        message: "Emotion frequency retrieved successfully",
        data: {
            frequency,
            period: `${days} days`,
        },
    };
    res.json(response);
});
//# sourceMappingURL=moodController.js.map