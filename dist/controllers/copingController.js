"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCopingStrategyStats = exports.getCopingStrategiesByType = exports.searchCopingStrategies = exports.getPopularStrategies = exports.getCopingStrategyTypes = exports.getPersonalizedSuggestions = exports.rateCopingStrategy = exports.getCopingStrategy = exports.getCopingStrategies = void 0;
const CopingStrategy_1 = require("../models/CopingStrategy");
const errorHandler_1 = require("../middleware/errorHandler");
const geminiService_1 = __importDefault(require("../services/geminiService"));
exports.getCopingStrategies = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    if (type) {
        query.type = type;
    }
    const total = await CopingStrategy_1.CopingStrategy.countDocuments(query);
    const strategies = await CopingStrategy_1.CopingStrategy.find(query)
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Coping strategies retrieved successfully",
        data: strategies,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getCopingStrategy = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const strategy = await CopingStrategy_1.CopingStrategy.findById(id);
    if (!strategy) {
        throw new errorHandler_1.CustomError("Coping strategy not found", 404, true);
    }
    const response = {
        success: true,
        message: "Coping strategy retrieved successfully",
        data: strategy,
    };
    res.json(response);
});
exports.rateCopingStrategy = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { rating } = req.body;
    const strategy = await CopingStrategy_1.CopingStrategy.findById(id);
    if (!strategy) {
        throw new errorHandler_1.CustomError("Coping strategy not found", 404, true);
    }
    await strategy.updateRating(rating);
    const response = {
        success: true,
        message: "Coping strategy rated successfully",
    };
    res.json(response);
});
exports.getPersonalizedSuggestions = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const { mood, emotions } = req.query;
    if (!mood || !emotions) {
        throw new errorHandler_1.CustomError("Mood and emotions are required", 400, true);
    }
    const moodValue = parseInt(mood);
    const emotionsArray = emotions.split(",");
    const suggestions = await geminiService_1.default.generateCopingSuggestions(moodValue, emotionsArray, req.user.preferences.language);
    const strategies = await CopingStrategy_1.CopingStrategy.find({
        $or: [
            { type: "mindfulness" },
            { type: "breathing" },
            { type: "grounding" },
        ],
    }).limit(5);
    const response = {
        success: true,
        message: "Personalized coping suggestions retrieved successfully",
        data: {
            aiSuggestions: suggestions,
            strategies: strategies.map((s) => ({
                id: s._id,
                title: s.title,
                description: s.description,
                type: s.type,
                duration: s.duration,
                steps: s.steps,
            })),
        },
    };
    res.json(response);
});
exports.getCopingStrategyTypes = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const types = [
        {
            id: "mindfulness",
            name: "Mindfulness",
            description: "Present-moment awareness and meditation techniques",
            icon: "🧘",
        },
        {
            id: "cbt",
            name: "Cognitive Behavioral Therapy",
            description: "Thought challenging and behavior modification techniques",
            icon: "🧠",
        },
        {
            id: "gratitude",
            name: "Gratitude Practice",
            description: "Focusing on positive aspects and appreciation",
            icon: "🙏",
        },
        {
            id: "breathing",
            name: "Breathing Exercises",
            description: "Controlled breathing techniques for relaxation",
            icon: "🫁",
        },
        {
            id: "grounding",
            name: "Grounding Techniques",
            description: "Methods to stay present and connected to reality",
            icon: "🌱",
        },
    ];
    const response = {
        success: true,
        message: "Coping strategy types retrieved successfully",
        data: types,
    };
    res.json(response);
});
exports.getPopularStrategies = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 5;
    const strategies = await CopingStrategy_1.CopingStrategy.find({})
        .sort({ rating: -1 })
        .limit(limit);
    const response = {
        success: true,
        message: "Popular coping strategies retrieved successfully",
        data: strategies,
    };
    res.json(response);
});
exports.searchCopingStrategies = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!q) {
        throw new errorHandler_1.CustomError("Search query is required", 400, true);
    }
    const searchQuery = {
        $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
        ],
    };
    const total = await CopingStrategy_1.CopingStrategy.countDocuments(searchQuery);
    const strategies = await CopingStrategy_1.CopingStrategy.find(searchQuery)
        .sort({ rating: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Coping strategies retrieved successfully",
        data: strategies,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getCopingStrategiesByType = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const validTypes = [
        "mindfulness",
        "cbt",
        "gratitude",
        "breathing",
        "grounding",
    ];
    if (!validTypes.includes(type)) {
        throw new errorHandler_1.CustomError("Invalid coping strategy type", 400, true);
    }
    const total = await CopingStrategy_1.CopingStrategy.countDocuments({ type });
    const strategies = await CopingStrategy_1.CopingStrategy.find({ type })
        .sort({ rating: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Coping strategies retrieved successfully",
        data: strategies,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    res.json(response);
});
exports.getCopingStrategyStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const stats = await CopingStrategy_1.CopingStrategy.aggregate([
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
                averageRating: { $avg: "$rating" },
            },
        },
        {
            $sort: { count: -1 },
        },
    ]);
    const totalStrategies = await CopingStrategy_1.CopingStrategy.countDocuments();
    const averageRating = await CopingStrategy_1.CopingStrategy.aggregate([
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            },
        },
    ]);
    const response = {
        success: true,
        message: "Coping strategy statistics retrieved successfully",
        data: {
            totalStrategies,
            averageRating: averageRating[0]?.averageRating || 0,
            byType: stats,
        },
    };
    res.json(response);
});
//# sourceMappingURL=copingController.js.map