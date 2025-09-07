"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSentimentDistribution = exports.getCommonThemes = exports.getJournalInsights = exports.searchJournalEntries = exports.getJournalAnalytics = exports.getAIPrompt = exports.deleteJournalEntry = exports.updateJournalEntry = exports.getJournalEntry = exports.getJournalEntries = exports.createJournalEntry = void 0;
const JournalEntry_1 = require("../models/JournalEntry");
const errorHandler_1 = require("../middleware/errorHandler");
const geminiService_1 = __importDefault(require("../services/geminiService"));
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
exports.createJournalEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { content, mood } = req.body;
    const userId = req.user._id;
    const sentiment = await geminiService_1.default.analyzeSentiment(content);
    const previousEntries = await JournalEntry_1.JournalEntry.find({ userId })
        .sort({ timestamp: -1 })
        .limit(3)
        .select("content");
    const previousContent = previousEntries.map((entry) => entry.content);
    const aiPrompt = await geminiService_1.default.generateJournalPrompt(mood, previousContent);
    const tags = extractTags(content);
    const journalEntry = new JournalEntry_1.JournalEntry({
        userId,
        content,
        mood,
        sentiment,
        aiPrompt,
        tags,
    });
    await journalEntry.save();
    const response = {
        success: true,
        message: "Journal entry created successfully",
        data: journalEntry,
    };
    res.status(201).json(response);
});
exports.getJournalEntries = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await JournalEntry_1.JournalEntry.countDocuments({ userId });
    const journalEntries = await JournalEntry_1.JournalEntry.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Journal entries retrieved successfully",
        data: journalEntries,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getJournalEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const journalEntry = await JournalEntry_1.JournalEntry.findOne({ _id: id, userId });
    if (!journalEntry) {
        throw new errorHandler_1.CustomError("Journal entry not found", 404, true);
    }
    const response = {
        success: true,
        message: "Journal entry retrieved successfully",
        data: journalEntry,
    };
    res.json(response);
});
exports.updateJournalEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { content, mood } = req.body;
    const journalEntry = await JournalEntry_1.JournalEntry.findOne({ _id: id, userId });
    if (!journalEntry) {
        throw new errorHandler_1.CustomError("Journal entry not found", 404, true);
    }
    if (content !== undefined) {
        journalEntry.content = content;
        journalEntry.sentiment = await geminiService_1.default.analyzeSentiment(content);
        journalEntry.tags = extractTags(content);
    }
    if (mood !== undefined)
        journalEntry.mood = mood;
    await journalEntry.save();
    const response = {
        success: true,
        message: "Journal entry updated successfully",
        data: journalEntry,
    };
    res.json(response);
});
exports.deleteJournalEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const journalEntry = await JournalEntry_1.JournalEntry.findOneAndDelete({
        _id: id,
        userId,
    });
    if (!journalEntry) {
        throw new errorHandler_1.CustomError("Journal entry not found", 404, true);
    }
    const response = {
        success: true,
        message: "Journal entry deleted successfully",
    };
    res.json(response);
});
exports.getAIPrompt = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const mood = parseInt(req.query.mood);
    const recentEntries = await JournalEntry_1.JournalEntry.find({ userId })
        .sort({ timestamp: -1 })
        .limit(5)
        .select("content");
    const previousContent = recentEntries.map((entry) => entry.content);
    const prompt = await geminiService_1.default.generateJournalPrompt(mood, previousContent);
    const response = {
        success: true,
        message: "AI prompt generated successfully",
        data: { prompt },
    };
    res.json(response);
});
exports.getJournalAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const analytics = await analyticsService_1.default.getJournalAnalytics(userId, days);
    const response = {
        success: true,
        message: "Journal analytics retrieved successfully",
        data: analytics,
    };
    res.json(response);
});
exports.searchJournalEntries = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!query) {
        throw new errorHandler_1.CustomError("Search query is required", 400, true);
    }
    const searchQuery = {
        userId,
        $text: { $search: query },
    };
    const total = await JournalEntry_1.JournalEntry.countDocuments(searchQuery);
    const journalEntries = await JournalEntry_1.JournalEntry.find(searchQuery)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Journal entries retrieved successfully",
        data: journalEntries,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getJournalInsights = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const insights = await analyticsService_1.default.getInsights(userId);
    const response = {
        success: true,
        message: "Journal insights retrieved successfully",
        data: {
            journalInsights: insights.journalInsights,
            recommendations: insights.recommendations,
        },
    };
    res.json(response);
});
exports.getCommonThemes = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const journalEntries = await JournalEntry_1.JournalEntry.find({
        userId,
        timestamp: { $gte: startDate },
    });
    const tagCount = {};
    journalEntries.forEach((entry) => {
        entry.tags.forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
    });
    const themes = Object.entries(tagCount)
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const response = {
        success: true,
        message: "Common themes retrieved successfully",
        data: {
            themes,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.getSentimentDistribution = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const journalEntries = await JournalEntry_1.JournalEntry.find({
        userId,
        timestamp: { $gte: startDate },
    });
    const distribution = {
        positive: 0,
        negative: 0,
        neutral: 0,
    };
    journalEntries.forEach((entry) => {
        distribution[entry.sentiment.label]++;
    });
    const response = {
        success: true,
        message: "Sentiment distribution retrieved successfully",
        data: {
            distribution,
            period: `${days} days`,
        },
    };
    res.json(response);
});
function extractTags(content) {
    const commonWords = [
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "can",
        "this",
        "that",
        "these",
        "those",
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
        "me",
        "him",
        "her",
        "us",
        "them",
    ];
    const words = content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !commonWords.includes(word));
    const wordCount = {};
    words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
}
//# sourceMappingURL=journalController.js.map