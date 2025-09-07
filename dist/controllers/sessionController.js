"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionTemplates = exports.getSessionInsights = exports.getSessionAnalytics = exports.getUserSessions = exports.getSession = exports.completeSession = exports.updateStep = exports.startSession = void 0;
const EightMinuteSession_1 = require("../models/EightMinuteSession");
const errorHandler_1 = require("../middleware/errorHandler");
const geminiService_1 = __importDefault(require("../services/geminiService"));
exports.startSession = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const steps = [
        {
            id: "breathing",
            title: "Deep Breathing",
            description: "Take 5 deep breaths to center yourself",
            duration: 2,
            completed: false,
        },
        {
            id: "mindfulness",
            title: "Mindfulness Check-in",
            description: "Notice how you feel in this moment",
            duration: 2,
            completed: false,
        },
        {
            id: "gratitude",
            title: "Gratitude Practice",
            description: "Think of 3 things you're grateful for",
            duration: 2,
            completed: false,
        },
        {
            id: "reflection",
            title: "Gentle Reflection",
            description: "Reflect on your day with kindness",
            duration: 2,
            completed: false,
        },
    ];
    const session = new EightMinuteSession_1.EightMinuteSession({
        userId,
        startTime: new Date(),
        steps,
    });
    await session.save();
    const response = {
        success: true,
        message: "8-minute session started successfully",
        data: session,
    };
    res.status(201).json(response);
});
exports.updateStep = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id, stepId } = req.params;
    const { data } = req.body;
    const userId = req.user._id;
    const session = await EightMinuteSession_1.EightMinuteSession.findOne({ _id: id, userId });
    if (!session) {
        throw new errorHandler_1.CustomError("Session not found", 404, true);
    }
    if (session.completed) {
        throw new errorHandler_1.CustomError("Session already completed", 400, true);
    }
    await session.updateStep(stepId, data);
    const response = {
        success: true,
        message: "Step updated successfully",
    };
    res.json(response);
});
exports.completeSession = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { overallMood, summary } = req.body;
    const userId = req.user._id;
    const session = await EightMinuteSession_1.EightMinuteSession.findOne({ _id: id, userId });
    if (!session) {
        throw new errorHandler_1.CustomError("Session not found", 404, true);
    }
    if (session.completed) {
        throw new errorHandler_1.CustomError("Session already completed", 400, true);
    }
    let finalSummary = summary;
    if (!finalSummary) {
        const completedSteps = session.steps.filter((step) => step.completed);
        finalSummary = await geminiService_1.default.generateSessionSummary(completedSteps, overallMood, req.user.preferences.language);
    }
    await session.completeSession(overallMood, finalSummary);
    const response = {
        success: true,
        message: "Session completed successfully",
        data: session,
    };
    res.json(response);
});
exports.getSession = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const session = await EightMinuteSession_1.EightMinuteSession.findOne({ _id: id, userId });
    if (!session) {
        throw new errorHandler_1.CustomError("Session not found", 404, true);
    }
    const response = {
        success: true,
        message: "Session retrieved successfully",
        data: session,
    };
    res.json(response);
});
exports.getUserSessions = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const completed = req.query.completed;
    const query = { userId };
    if (completed !== undefined) {
        query.completed = completed === "true";
    }
    const total = await EightMinuteSession_1.EightMinuteSession.countDocuments(query);
    const sessions = await EightMinuteSession_1.EightMinuteSession.find(query)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Sessions retrieved successfully",
        data: sessions,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getSessionAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const totalSessions = await EightMinuteSession_1.EightMinuteSession.countDocuments({
        userId,
        startTime: { $gte: startDate },
    });
    const completedSessions = await EightMinuteSession_1.EightMinuteSession.countDocuments({
        userId,
        startTime: { $gte: startDate },
        completed: true,
    });
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const moodStats = await EightMinuteSession_1.EightMinuteSession.aggregate([
        {
            $match: {
                userId,
                startTime: { $gte: startDate },
                completed: true,
                overallMood: { $exists: true },
            },
        },
        {
            $group: {
                _id: null,
                averageMood: { $avg: "$overallMood" },
                minMood: { $min: "$overallMood" },
                maxMood: { $max: "$overallMood" },
            },
        },
    ]);
    const dailyStats = await EightMinuteSession_1.EightMinuteSession.aggregate([
        {
            $match: {
                userId,
                startTime: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
                },
                sessionCount: { $sum: 1 },
                completedCount: {
                    $sum: { $cond: ["$completed", 1, 0] },
                },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const stepStats = await EightMinuteSession_1.EightMinuteSession.aggregate([
        {
            $match: {
                userId,
                startTime: { $gte: startDate },
            },
        },
        {
            $unwind: "$steps",
        },
        {
            $group: {
                _id: "$steps.id",
                title: { $first: "$steps.title" },
                completedCount: {
                    $sum: { $cond: ["$steps.completed", 1, 0] },
                },
                totalCount: { $sum: 1 },
            },
        },
        {
            $addFields: {
                completionRate: {
                    $multiply: [{ $divide: ["$completedCount", "$totalCount"] }, 100],
                },
            },
        },
        {
            $sort: { completionRate: -1 },
        },
    ]);
    const response = {
        success: true,
        message: "Session analytics retrieved successfully",
        data: {
            totalSessions,
            completedSessions,
            completionRate: Math.round(completionRate * 100) / 100,
            averageMood: moodStats[0]?.averageMood || 0,
            moodRange: {
                min: moodStats[0]?.minMood || 0,
                max: moodStats[0]?.maxMood || 0,
            },
            dailyStats,
            stepStats,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.getSessionInsights = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const sessions = await EightMinuteSession_1.EightMinuteSession.find({
        userId,
        startTime: { $gte: startDate },
        completed: true,
    }).sort({ startTime: -1 });
    const insights = [];
    if (sessions.length === 0) {
        insights.push("You haven't completed any 8-minute sessions recently. Consider starting one today!");
    }
    else if (sessions.length < 3) {
        insights.push("You've completed a few sessions recently. Regular practice can help improve your wellbeing.");
    }
    else {
        insights.push("Great job! You've been consistent with your 8-minute sessions. Keep up the excellent work!");
    }
    const moodEntries = sessions
        .filter((s) => s.overallMood)
        .map((s) => s.overallMood);
    if (moodEntries.length > 1) {
        const recentMood = moodEntries.slice(0, 3);
        const olderMood = moodEntries.slice(-3);
        const recentAvg = recentMood.reduce((a, b) => a + b, 0) / recentMood.length;
        const olderAvg = olderMood.reduce((a, b) => a + b, 0) / olderMood.length;
        if (recentAvg > olderAvg + 1) {
            insights.push("Your mood has been improving after completing sessions!");
        }
        else if (recentAvg < olderAvg - 1) {
            insights.push("Your mood has been lower recently. Consider trying different session types.");
        }
    }
    const allSteps = sessions.flatMap((s) => s.steps);
    const stepCompletion = allSteps.reduce((acc, step) => {
        acc[step.id] = (acc[step.id] || 0) + (step.completed ? 1 : 0);
        return acc;
    }, {});
    const mostCompletedStep = Object.entries(stepCompletion).sort((a, b) => b[1] - a[1])[0];
    if (mostCompletedStep) {
        const stepNames = {
            breathing: "Deep Breathing",
            mindfulness: "Mindfulness Check-in",
            gratitude: "Gratitude Practice",
            reflection: "Gentle Reflection",
        };
        insights.push(`You complete the ${stepNames[mostCompletedStep[0]]} step most often.`);
    }
    const response = {
        success: true,
        message: "Session insights retrieved successfully",
        data: {
            insights,
            totalSessions: sessions.length,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.getSessionTemplates = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const templates = [
        {
            id: "mindfulness",
            title: "Mindfulness Session",
            description: "A calming mindfulness practice",
            duration: 8,
            steps: [
                {
                    id: "breathing",
                    title: "Breathing Exercise",
                    description: "Focus on your breath for 2 minutes",
                    duration: 2,
                },
                {
                    id: "body-scan",
                    title: "Body Scan",
                    description: "Notice sensations in your body",
                    duration: 3,
                },
                {
                    id: "mindfulness",
                    title: "Present Moment Awareness",
                    description: "Observe your thoughts without judgment",
                    duration: 3,
                },
            ],
        },
        {
            id: "gratitude",
            title: "Gratitude Session",
            description: "A positive reflection practice",
            duration: 8,
            steps: [
                {
                    id: "breathing",
                    title: "Centering Breath",
                    description: "Take 5 deep breaths to center yourself",
                    duration: 1,
                },
                {
                    id: "gratitude",
                    title: "Gratitude Practice",
                    description: "Think of 3 things you're grateful for",
                    duration: 3,
                },
                {
                    id: "reflection",
                    title: "Positive Reflection",
                    description: "Reflect on positive moments from your day",
                    duration: 4,
                },
            ],
        },
        {
            id: "stress-relief",
            title: "Stress Relief Session",
            description: "A calming practice for stress management",
            duration: 8,
            steps: [
                {
                    id: "breathing",
                    title: "Deep Breathing",
                    description: "Practice 4-7-8 breathing technique",
                    duration: 3,
                },
                {
                    id: "progressive-relaxation",
                    title: "Progressive Relaxation",
                    description: "Tense and release different muscle groups",
                    duration: 3,
                },
                {
                    id: "visualization",
                    title: "Calming Visualization",
                    description: "Imagine a peaceful place",
                    duration: 2,
                },
            ],
        },
    ];
    const response = {
        success: true,
        message: "Session templates retrieved successfully",
        data: templates,
    };
    res.json(response);
});
//# sourceMappingURL=sessionController.js.map