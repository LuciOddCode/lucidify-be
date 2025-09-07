import { Request, Response, NextFunction } from "express";
import { EightMinuteSession } from "@/models/EightMinuteSession";
import { ApiResponse, PaginatedResponse, SessionStep } from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { getGeminiService } from "@/services/geminiService";
import { v4 as uuidv4 } from "uuid";

// Start 8-minute session
export const startSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Create session steps
    const steps: SessionStep[] = [
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

    const session = new EightMinuteSession({
      userId,
      startTime: new Date(),
      steps,
    });

    await session.save();

    const response: ApiResponse = {
      success: true,
      message: "8-minute session started successfully",
      data: session,
    };

    res.status(201).json(response);
  }
);

// Update session step
export const updateStep = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, stepId } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    const session = await EightMinuteSession.findOne({ _id: id, userId });

    if (!session) {
      throw new CustomError("Session not found", 404, true);
    }

    if (session.completed) {
      throw new CustomError("Session already completed", 400, true);
    }

    // Update step
    await session.updateStep(stepId, data);

    const response: ApiResponse = {
      success: true,
      message: "Step updated successfully",
    };

    res.json(response);
  }
);

// Complete session
export const completeSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { overallMood, summary } = req.body;
    const userId = req.user._id;

    const session = await EightMinuteSession.findOne({ _id: id, userId });

    if (!session) {
      throw new CustomError("Session not found", 404, true);
    }

    if (session.completed) {
      throw new CustomError("Session already completed", 400, true);
    }

    // Generate AI summary if not provided
    let finalSummary = summary;
    if (!finalSummary) {
      const completedSteps = session.steps.filter((step) => step.completed);
      finalSummary = await getGeminiService().generateSessionSummary(
        completedSteps,
        overallMood,
        req.user.preferences.language
      );
    }

    // Complete session
    await session.completeSession(overallMood, finalSummary);

    const response: ApiResponse = {
      success: true,
      message: "Session completed successfully",
      data: session,
    };

    res.json(response);
  }
);

// Get session by ID
export const getSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await EightMinuteSession.findOne({ _id: id, userId });

    if (!session) {
      throw new CustomError("Session not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Session retrieved successfully",
      data: session,
    };

    res.json(response);
  }
);

// Get user sessions
export const getUserSessions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const completed = req.query.completed;

    // Build query
    const query: any = { userId };
    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    // Get total count
    const total = await EightMinuteSession.countDocuments(query);

    // Get sessions
    const sessions = await EightMinuteSession.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof sessions)[0]> = {
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
  }
);

// Get session analytics
export const getSessionAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get session statistics
    const totalSessions = await EightMinuteSession.countDocuments({
      userId,
      startTime: { $gte: startDate },
    });

    const completedSessions = await EightMinuteSession.countDocuments({
      userId,
      startTime: { $gte: startDate },
      completed: true,
    });

    const completionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get average mood
    const moodStats = await EightMinuteSession.aggregate([
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

    // Get daily session count
    const dailyStats = await EightMinuteSession.aggregate([
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

    // Get most common step completion
    const stepStats = await EightMinuteSession.aggregate([
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

    const response: ApiResponse = {
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
  }
);

// Get session insights
export const getSessionInsights = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await EightMinuteSession.find({
      userId,
      startTime: { $gte: startDate },
      completed: true,
    }).sort({ startTime: -1 });

    const insights = [];

    if (sessions.length === 0) {
      insights.push(
        "You haven't completed any 8-minute sessions recently. Consider starting one today!"
      );
    } else if (sessions.length < 3) {
      insights.push(
        "You've completed a few sessions recently. Regular practice can help improve your wellbeing."
      );
    } else {
      insights.push(
        "Great job! You've been consistent with your 8-minute sessions. Keep up the excellent work!"
      );
    }

    // Analyze mood trends
    const moodEntries = sessions
      .filter((s) => s.overallMood)
      .map((s) => s.overallMood!);
    if (moodEntries.length > 1) {
      const recentMood = moodEntries.slice(0, 3);
      const olderMood = moodEntries.slice(-3);

      const recentAvg =
        recentMood.reduce((a, b) => a + b, 0) / recentMood.length;
      const olderAvg = olderMood.reduce((a, b) => a + b, 0) / olderMood.length;

      if (recentAvg > olderAvg + 1) {
        insights.push(
          "Your mood has been improving after completing sessions!"
        );
      } else if (recentAvg < olderAvg - 1) {
        insights.push(
          "Your mood has been lower recently. Consider trying different session types."
        );
      }
    }

    // Analyze step completion
    const allSteps = sessions.flatMap((s) => s.steps);
    const stepCompletion = allSteps.reduce((acc, step) => {
      acc[step.id] = (acc[step.id] || 0) + (step.completed ? 1 : 0);
      return acc;
    }, {} as { [key: string]: number });

    const mostCompletedStep = Object.entries(stepCompletion).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (mostCompletedStep) {
      const stepNames = {
        breathing: "Deep Breathing",
        mindfulness: "Mindfulness Check-in",
        gratitude: "Gratitude Practice",
        reflection: "Gentle Reflection",
      };
      insights.push(
        `You complete the ${
          stepNames[mostCompletedStep[0] as keyof typeof stepNames]
        } step most often.`
      );
    }

    const response: ApiResponse = {
      success: true,
      message: "Session insights retrieved successfully",
      data: {
        insights,
        totalSessions: sessions.length,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);

// Get session templates
export const getSessionTemplates = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const response: ApiResponse = {
      success: true,
      message: "Session templates retrieved successfully",
      data: templates,
    };

    res.json(response);
  }
);
