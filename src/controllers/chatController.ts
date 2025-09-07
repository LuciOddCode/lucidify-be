import { Request, Response, NextFunction } from "express";
import { ChatMessage } from "@/models/ChatMessage";
import { ChatSession } from "@/models/ChatSession";
import { ApiResponse, PaginatedResponse, ChatRequest } from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { getGeminiService } from "@/services/geminiService";
import { v4 as uuidv4 } from "uuid";

// Send chat message
export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message, sessionId }: ChatRequest = req.body;
    const userId = req.user._id;
    const userLanguage = req.user.preferences.language;

    let chatSession;

    // Get or create chat session
    if (sessionId) {
      chatSession = await ChatSession.findOne({ _id: sessionId, userId });
      if (!chatSession) {
        throw new CustomError("Chat session not found", 404, true);
      }
    } else {
      // Create new session
      chatSession = new ChatSession({
        userId,
        startTime: new Date(),
      });
      await chatSession.save();
    }

    // Save user message
    const userMessage = new ChatMessage({
      userId,
      sessionId: chatSession._id,
      content: message,
      isUser: true,
    });
    await userMessage.save();

    // Get chat history for context
    const chatHistory = await ChatMessage.find({
      sessionId: chatSession._id,
    })
      .sort({ timestamp: 1 })
      .limit(10); // Last 10 messages for context

    // Build context from recent messages
    const context = chatHistory
      .map((msg) => `${msg.isUser ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    // Generate AI response
    const { content: aiResponse, suggestions } =
      await getGeminiService().generateChatResponse(
        message,
        context,
        userLanguage
      );

    // Save AI response
    const aiMessage = new ChatMessage({
      userId,
      sessionId: chatSession._id,
      content: aiResponse,
      isUser: false,
      suggestions,
    });
    await aiMessage.save();

    // Update session message count
    chatSession.messageCount += 2; // User message + AI response
    await chatSession.save();

    const response: ApiResponse = {
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
  }
);

// Get chat history for a session
export const getChatHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Verify session belongs to user
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new CustomError("Chat session not found", 404, true);
    }

    // Get messages
    const messages = await ChatMessage.find({
      sessionId,
      userId,
    }).sort({ timestamp: 1 });

    const response: ApiResponse = {
      success: true,
      message: "Chat history retrieved successfully",
      data: messages,
    };

    res.json(response);
  }
);

// Get all chat sessions for user
export const getChatSessions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await ChatSession.countDocuments({ userId });

    // Get sessions
    const sessions = await ChatSession.find({ userId })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof sessions)[0]> = {
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
  }
);

// End chat session
export const endChatSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new CustomError("Chat session not found", 404, true);
    }

    if (session.endTime) {
      throw new CustomError("Chat session already ended", 400, true);
    }

    session.endTime = new Date();
    await session.save();

    const response: ApiResponse = {
      success: true,
      message: "Chat session ended successfully",
      data: session,
    };

    res.json(response);
  }
);

// Delete chat session
export const deleteChatSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Delete session and all associated messages
    const session = await ChatSession.findOneAndDelete({
      _id: sessionId,
      userId,
    });
    if (!session) {
      throw new CustomError("Chat session not found", 404, true);
    }

    await ChatMessage.deleteMany({ sessionId });

    const response: ApiResponse = {
      success: true,
      message: "Chat session deleted successfully",
    };

    res.json(response);
  }
);

// Get chat suggestions
export const getChatSuggestions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const userSuggestions =
      suggestions[userLanguage as keyof typeof suggestions] || suggestions.en;

    const response: ApiResponse = {
      success: true,
      message: "Chat suggestions retrieved successfully",
      data: {
        suggestions: userSuggestions,
      },
    };

    res.json(response);
  }
);

// Get chat analytics
export const getChatAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get chat statistics
    const totalSessions = await ChatSession.countDocuments({
      userId,
      startTime: { $gte: startDate },
    });

    const totalMessages = await ChatMessage.countDocuments({
      userId,
      timestamp: { $gte: startDate },
    });

    const averageMessagesPerSession =
      totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

    // Get most active days
    const dailyStats = await ChatMessage.aggregate([
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

    const response: ApiResponse = {
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
  }
);

// Get chat insights
export const getChatInsights = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get recent messages for analysis
    const recentMessages = await ChatMessage.find({
      userId,
      isUser: true,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: -1 })
      .limit(20);

    const insights = [];

    if (recentMessages.length === 0) {
      insights.push(
        "You haven't used the chat feature recently. Consider reaching out when you need support."
      );
    } else if (recentMessages.length < 5) {
      insights.push(
        "You've been using the chat feature occasionally. It can be helpful to check in regularly."
      );
    } else {
      insights.push(
        "You've been actively using the chat feature. This is great for your mental health journey!"
      );
    }

    // Analyze message content for common themes
    const commonWords = recentMessages
      .flatMap((msg) => msg.content.toLowerCase().split(/\s+/))
      .filter((word) => word.length > 3)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const topWords = Object.entries(commonWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    if (topWords.length > 0) {
      insights.push(
        `Common topics in your recent chats: ${topWords.join(", ")}`
      );
    }

    const response: ApiResponse = {
      success: true,
      message: "Chat insights retrieved successfully",
      data: {
        insights,
        messageCount: recentMessages.length,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);
