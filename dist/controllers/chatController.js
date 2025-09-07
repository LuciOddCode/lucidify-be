"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatInsights = exports.getChatAnalytics = exports.getChatSuggestions = exports.deleteChatSession = exports.endChatSession = exports.getChatSessions = exports.getChatHistory = exports.sendMessage = void 0;
const ChatMessage_1 = require("../models/ChatMessage");
const ChatSession_1 = require("../models/ChatSession");
const errorHandler_1 = require("../middleware/errorHandler");
const geminiService_1 = __importDefault(require("../services/geminiService"));
exports.sendMessage = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { message, sessionId } = req.body;
    const userId = req.user._id;
    const userLanguage = req.user.preferences.language;
    let chatSession;
    if (sessionId) {
        chatSession = await ChatSession_1.ChatSession.findOne({ _id: sessionId, userId });
        if (!chatSession) {
            throw new errorHandler_1.CustomError("Chat session not found", 404, true);
        }
    }
    else {
        chatSession = new ChatSession_1.ChatSession({
            userId,
            startTime: new Date(),
        });
        await chatSession.save();
    }
    const userMessage = new ChatMessage_1.ChatMessage({
        userId,
        sessionId: chatSession._id,
        content: message,
        isUser: true,
    });
    await userMessage.save();
    const chatHistory = await ChatMessage_1.ChatMessage.find({
        sessionId: chatSession._id,
    })
        .sort({ timestamp: 1 })
        .limit(10);
    const context = chatHistory
        .map((msg) => `${msg.isUser ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");
    const { content: aiResponse, suggestions } = await geminiService_1.default.generateChatResponse(message, context, userLanguage);
    const aiMessage = new ChatMessage_1.ChatMessage({
        userId,
        sessionId: chatSession._id,
        content: aiResponse,
        isUser: false,
        suggestions,
    });
    await aiMessage.save();
    chatSession.messageCount += 2;
    await chatSession.save();
    const response = {
        success: true,
        message: "Message sent successfully",
        data: {
            message: {
                id: aiMessage._id,
                content: aiMessage.content,
                isUser: aiMessage.isUser,
                suggestions: aiMessage.suggestions,
                timestamp: aiMessage.timestamp,
            },
            sessionId: chatSession._id,
        },
    };
    res.json(response);
});
exports.getChatHistory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { sessionId } = req.params;
    const userId = req.user._id;
    const session = await ChatSession_1.ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
        throw new errorHandler_1.CustomError("Chat session not found", 404, true);
    }
    const messages = await ChatMessage_1.ChatMessage.find({
        sessionId,
        userId,
    }).sort({ timestamp: 1 });
    const response = {
        success: true,
        message: "Chat history retrieved successfully",
        data: messages,
    };
    res.json(response);
});
exports.getChatSessions = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await ChatSession_1.ChatSession.countDocuments({ userId });
    const sessions = await ChatSession_1.ChatSession.find({ userId })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit);
    const totalPages = Math.ceil(total / limit);
    const response = {
        success: true,
        message: "Chat sessions retrieved successfully",
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
exports.endChatSession = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { sessionId } = req.params;
    const userId = req.user._id;
    const session = await ChatSession_1.ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
        throw new errorHandler_1.CustomError("Chat session not found", 404, true);
    }
    if (session.endTime) {
        throw new errorHandler_1.CustomError("Chat session already ended", 400, true);
    }
    session.endTime = new Date();
    await session.save();
    const response = {
        success: true,
        message: "Chat session ended successfully",
        data: session,
    };
    res.json(response);
});
exports.deleteChatSession = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { sessionId } = req.params;
    const userId = req.user._id;
    const session = await ChatSession_1.ChatSession.findOneAndDelete({
        _id: sessionId,
        userId,
    });
    if (!session) {
        throw new errorHandler_1.CustomError("Chat session not found", 404, true);
    }
    await ChatMessage_1.ChatMessage.deleteMany({ sessionId });
    const response = {
        success: true,
        message: "Chat session deleted successfully",
    };
    res.json(response);
});
exports.getChatSuggestions = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userLanguage = req.user.preferences.language;
    const suggestions = {
        en: [
            "I'm feeling anxious today",
            "I had a great day!",
            "I'm struggling with motivation",
            "I want to talk about my relationships",
            "I'm feeling overwhelmed",
            "I need help with sleep",
            "I'm dealing with stress at work",
            "I want to practice mindfulness",
        ],
        si: [
            "අද මට කරදරයක් දැනෙනවා",
            "අද මට හොඳ දිනයක් ගත වුණා!",
            "මට අභිප්‍රේරණය ගැන ගැටලුවක් තියෙනවා",
            "මට මගේ සම්බන්ධතා ගැන කතා කිරීමට අවශ්‍යයි",
            "මට අධික බරක් දැනෙනවා",
            "මට නින්ද ගැන උදව් අවශ්‍යයි",
            "මට වැඩේ ගැන ආතතියක් තියෙනවා",
            "මට සතිඥානය පුරුදු කිරීමට අවශ්‍යයි",
        ],
        ta: [
            "இன்று எனக்கு கவலை உள்ளது",
            "இன்று எனக்கு நல்ல நாள்!",
            "எனக்கு உந்துதல் பிரச்சினை உள்ளது",
            "எனது உறவுகளைப் பற்றி பேச விரும்புகிறேன்",
            "எனக்கு அதிக சுமை தெரிகிறது",
            "எனக்கு தூக்கம் பற்றி உதவி தேவை",
            "வேலையில் மன அழுத்தம் உள்ளது",
            "நான் மனநிலை பயிற்சி செய்ய விரும்புகிறேன்",
        ],
    };
    const userSuggestions = suggestions[userLanguage] || suggestions.en;
    const response = {
        success: true,
        message: "Chat suggestions retrieved successfully",
        data: {
            suggestions: userSuggestions,
        },
    };
    res.json(response);
});
exports.getChatAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const totalSessions = await ChatSession_1.ChatSession.countDocuments({
        userId,
        startTime: { $gte: startDate },
    });
    const totalMessages = await ChatMessage_1.ChatMessage.countDocuments({
        userId,
        timestamp: { $gte: startDate },
    });
    const averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;
    const dailyStats = await ChatMessage_1.ChatMessage.aggregate([
        {
            $match: {
                userId,
                timestamp: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                messageCount: { $sum: 1 },
            },
        },
        {
            $sort: { messageCount: -1 },
        },
        {
            $limit: 7,
        },
    ]);
    const response = {
        success: true,
        message: "Chat analytics retrieved successfully",
        data: {
            totalSessions,
            totalMessages,
            averageMessagesPerSession,
            mostActiveDays: dailyStats,
            period: `${days} days`,
        },
    };
    res.json(response);
});
exports.getChatInsights = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const recentMessages = await ChatMessage_1.ChatMessage.find({
        userId,
        isUser: true,
        timestamp: { $gte: startDate },
    })
        .sort({ timestamp: -1 })
        .limit(20);
    const insights = [];
    if (recentMessages.length === 0) {
        insights.push("You haven't used the chat feature recently. Consider reaching out when you need support.");
    }
    else if (recentMessages.length < 5) {
        insights.push("You've been using the chat feature occasionally. It can be helpful to check in regularly.");
    }
    else {
        insights.push("You've been actively using the chat feature. This is great for your mental health journey!");
    }
    const commonWords = recentMessages
        .flatMap((msg) => msg.content.toLowerCase().split(/\s+/))
        .filter((word) => word.length > 3)
        .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});
    const topWords = Object.entries(commonWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
    if (topWords.length > 0) {
        insights.push(`Common topics in your recent chats: ${topWords.join(", ")}`);
    }
    const response = {
        success: true,
        message: "Chat insights retrieved successfully",
        data: {
            insights,
            messageCount: recentMessages.length,
            period: `${days} days`,
        },
    };
    res.json(response);
});
//# sourceMappingURL=chatController.js.map