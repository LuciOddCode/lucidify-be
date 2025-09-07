import { Request, Response, NextFunction } from "express";
import { JournalEntry } from "@/models/JournalEntry";
import {
  ApiResponse,
  PaginatedResponse,
  JournalCreateRequest,
  JournalAnalytics,
} from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { getGeminiService } from "@/services/geminiService";
import analyticsService from "@/services/analyticsService";

// Create journal entry
export const createJournalEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content, mood }: JournalCreateRequest = req.body;
    const userId = req.user._id;

    // Analyze sentiment
    const sentiment = await getGeminiService().analyzeSentiment(content);

    // Generate AI prompt for future entries
    const previousEntries = await JournalEntry.find({ userId })
      .sort({ timestamp: -1 })
      .limit(3)
      .select("content");

    const previousContent = previousEntries.map((entry) => entry.content);
    const aiPrompt = await getGeminiService().generateJournalPrompt(
      mood,
      previousContent
    );

    // Extract tags from content (simplified - in real app, use NLP)
    const tags = extractTags(content);

    // Create journal entry
    const journalEntry = new JournalEntry({
      userId,
      content,
      mood,
      sentiment,
      aiPrompt,
      tags,
    });

    await journalEntry.save();

    const response: ApiResponse = {
      success: true,
      message: "Journal entry created successfully",
      data: journalEntry,
    };

    res.status(201).json(response);
  }
);

// Get journal entries with pagination
export const getJournalEntries = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await JournalEntry.countDocuments({ userId });

    // Get journal entries
    const journalEntries = await JournalEntry.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof journalEntries)[0]> = {
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
  }
);

// Get journal entry by ID
export const getJournalEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const journalEntry = await JournalEntry.findOne({ _id: id, userId });

    if (!journalEntry) {
      throw new CustomError("Journal entry not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Journal entry retrieved successfully",
      data: journalEntry,
    };

    res.json(response);
  }
);

// Update journal entry
export const updateJournalEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { content, mood } = req.body;

    const journalEntry = await JournalEntry.findOne({ _id: id, userId });

    if (!journalEntry) {
      throw new CustomError("Journal entry not found", 404, true);
    }

    // Update fields
    if (content !== undefined) {
      journalEntry.content = content;
      // Re-analyze sentiment
      journalEntry.sentiment = await getGeminiService().analyzeSentiment(
        content
      );
      // Update tags
      journalEntry.tags = extractTags(content);
    }
    if (mood !== undefined) journalEntry.mood = mood;

    await journalEntry.save();

    const response: ApiResponse = {
      success: true,
      message: "Journal entry updated successfully",
      data: journalEntry,
    };

    res.json(response);
  }
);

// Delete journal entry
export const deleteJournalEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const journalEntry = await JournalEntry.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!journalEntry) {
      throw new CustomError("Journal entry not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Journal entry deleted successfully",
    };

    res.json(response);
  }
);

// Get AI journal prompt
export const getAIPrompt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const mood = parseInt(req.query.mood as string);

    // Get recent entries for context
    const recentEntries = await JournalEntry.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .select("content");

    const previousContent = recentEntries.map((entry) => entry.content);
    const prompt = await getGeminiService().generateJournalPrompt(
      mood,
      previousContent
    );

    const response: ApiResponse = {
      success: true,
      message: "AI prompt generated successfully",
      data: { prompt },
    };

    res.json(response);
  }
);

// Get journal analytics
export const getJournalAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await analyticsService.getJournalAnalytics(userId, days);

    const response: ApiResponse<JournalAnalytics> = {
      success: true,
      message: "Journal analytics retrieved successfully",
      data: analytics,
    };

    res.json(response);
  }
);

// Search journal entries
export const searchJournalEntries = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!query) {
      throw new CustomError("Search query is required", 400, true);
    }

    // Search in content using MongoDB text search
    const searchQuery = {
      userId,
      $text: { $search: query },
    };

    // Get total count
    const total = await JournalEntry.countDocuments(searchQuery);

    // Get journal entries
    const journalEntries = await JournalEntry.find(searchQuery)
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof journalEntries)[0]> = {
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
  }
);

// Get journal insights
export const getJournalInsights = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    const insights = await analyticsService.getInsights(userId);

    const response: ApiResponse = {
      success: true,
      message: "Journal insights retrieved successfully",
      data: {
        journalInsights: insights.journalInsights,
        recommendations: insights.recommendations,
      },
    };

    res.json(response);
  }
);

// Get common themes
export const getCommonThemes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const journalEntries = await JournalEntry.find({
      userId,
      timestamp: { $gte: startDate },
    });

    // Count tag frequency
    const tagCount: { [key: string]: number } = {};

    journalEntries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const themes = Object.entries(tagCount)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const response: ApiResponse = {
      success: true,
      message: "Common themes retrieved successfully",
      data: {
        themes,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);

// Get sentiment distribution
export const getSentimentDistribution = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const journalEntries = await JournalEntry.find({
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

    const response: ApiResponse = {
      success: true,
      message: "Sentiment distribution retrieved successfully",
      data: {
        distribution,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);

// Helper function to extract tags from content
function extractTags(content: string): string[] {
  // Simple keyword extraction - in a real app, use proper NLP
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

  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Return top 5 most frequent words as tags
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
