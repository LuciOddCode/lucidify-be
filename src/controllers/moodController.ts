import { Request, Response, NextFunction } from "express";
import { MoodEntry } from "@/models/MoodEntry";
import {
  ApiResponse,
  PaginatedResponse,
  MoodLogRequest,
  MoodAnalytics,
  SentimentAnalysis,
} from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { getGeminiService } from "@/services/geminiService";
import analyticsService from "@/services/analyticsService";

// Log mood entry
export const logMood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mood, emotions, notes, voiceTranscript }: MoodLogRequest = req.body;
    const userId = req.user._id;

    // Analyze sentiment if notes or voice transcript provided
    let sentiment: SentimentAnalysis = {
      score: 0,
      label: "neutral",
      confidence: 0.5,
    };

    if (notes || voiceTranscript) {
      const textToAnalyze = notes || voiceTranscript || "";
      sentiment = await getGeminiService().analyzeSentiment(textToAnalyze);
    }

    // Create mood entry
    const moodEntry = new MoodEntry({
      userId,
      mood,
      emotions: emotions || [],
      notes,
      voiceTranscript,
      sentiment,
    });

    await moodEntry.save();

    const response: ApiResponse = {
      success: true,
      message: "Mood logged successfully",
      data: moodEntry,
    };

    res.status(201).json(response);
  }
);

// Get mood entries with pagination
export const getMoodEntries = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await MoodEntry.countDocuments({ userId });

    // Get mood entries
    const moodEntries = await MoodEntry.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof moodEntries)[0]> = {
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
  }
);

// Get mood analytics
export const getMoodAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await analyticsService.getMoodAnalytics(userId, days);

    const response: ApiResponse<MoodAnalytics> = {
      success: true,
      message: "Mood analytics retrieved successfully",
      data: analytics,
    };

    res.json(response);
  }
);

// Get mood entry by ID
export const getMoodEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const moodEntry = await MoodEntry.findOne({ _id: id, userId });

    if (!moodEntry) {
      throw new CustomError("Mood entry not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Mood entry retrieved successfully",
      data: moodEntry,
    };

    res.json(response);
  }
);

// Update mood entry
export const updateMoodEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { mood, emotions, notes, voiceTranscript } = req.body;

    const moodEntry = await MoodEntry.findOne({ _id: id, userId });

    if (!moodEntry) {
      throw new CustomError("Mood entry not found", 404, true);
    }

    // Update fields
    if (mood !== undefined) moodEntry.mood = mood;
    if (emotions !== undefined) moodEntry.emotions = emotions;
    if (notes !== undefined) moodEntry.notes = notes;
    if (voiceTranscript !== undefined)
      moodEntry.voiceTranscript = voiceTranscript;

    // Re-analyze sentiment if text content changed
    if (notes !== undefined || voiceTranscript !== undefined) {
      const textToAnalyze = moodEntry.notes || moodEntry.voiceTranscript || "";
      if (textToAnalyze) {
        moodEntry.sentiment = await getGeminiService().analyzeSentiment(
          textToAnalyze
        );
      }
    }

    await moodEntry.save();

    const response: ApiResponse = {
      success: true,
      message: "Mood entry updated successfully",
      data: moodEntry,
    };

    res.json(response);
  }
);

// Delete mood entry
export const deleteMoodEntry = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const moodEntry = await MoodEntry.findOneAndDelete({ _id: id, userId });

    if (!moodEntry) {
      throw new CustomError("Mood entry not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Mood entry deleted successfully",
    };

    res.json(response);
  }
);

// Get mood insights
export const getMoodInsights = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    const insights = await analyticsService.getInsights(userId);

    const response: ApiResponse = {
      success: true,
      message: "Mood insights retrieved successfully",
      data: {
        moodInsights: insights.moodInsights,
        recommendations: insights.recommendations,
      },
    };

    res.json(response);
  }
);

// Get mood trends
export const getMoodTrends = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodEntries = await MoodEntry.find({
      userId,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    // Calculate daily averages
    const dailyAverages: { [key: string]: { mood: number; count: number } } =
      {};

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

    const response: ApiResponse = {
      success: true,
      message: "Mood trends retrieved successfully",
      data: {
        trends,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);

// Get emotion frequency
export const getEmotionFrequency = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodEntries = await MoodEntry.find({
      userId,
      timestamp: { $gte: startDate },
    });

    // Count emotion frequency
    const emotionCount: { [key: string]: number } = {};

    moodEntries.forEach((entry) => {
      entry.emotions.forEach((emotion) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      });
    });

    const frequency = Object.entries(emotionCount)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);

    const response: ApiResponse = {
      success: true,
      message: "Emotion frequency retrieved successfully",
      data: {
        frequency,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);
