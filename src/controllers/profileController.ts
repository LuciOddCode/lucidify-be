import { Request, Response, NextFunction } from "express";
import { User } from "@/models/User";
import {
  ApiResponse,
  ProfileUpdateRequest,
  TrustedContactRequest,
} from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import emailService from "@/services/emailService";
import analyticsService from "@/services/analyticsService";

// Get user profile
export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const response: ApiResponse = {
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
  }
);

// Update user profile
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, preferences }: ProfileUpdateRequest = req.body;
    const userId = req.user._id;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (preferences !== undefined) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new CustomError("User not found", 404, true);
    }

    const response: ApiResponse = {
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
  }
);

// Set trusted contact
export const setTrustedContact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone }: TrustedContactRequest = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        "preferences.trustedContact": {
          name,
          email,
          phone,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new CustomError("User not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Trusted contact set successfully",
    };

    res.json(response);
  }
);

// Test trusted contact
export const testTrustedContact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user.preferences.trustedContact) {
      throw new CustomError("No trusted contact set", 400, true);
    }

    const { name, email } = user.preferences.trustedContact;
    const message = `This is a test message from ${
      user.name || user.email
    } to verify the trusted contact feature.`;

    const emailSent = await emailService.sendTrustedContactNotification(
      email,
      user.name || user.email,
      message,
      user.preferences.language
    );

    if (!emailSent) {
      throw new CustomError("Failed to send test email", 500, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Test email sent successfully to trusted contact",
    };

    res.json(response);
  }
);

// Export user data
export const exportData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // This would typically generate a comprehensive data export
    // For now, return a placeholder response
    const response: ApiResponse = {
      success: true,
      message: "Data export initiated",
      data: {
        downloadUrl: `${
          process.env.FRONTEND_URL
        }/download/export-${userId}-${Date.now()}.json`,
      },
    };

    res.json(response);
  }
);

// Delete user account
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Delete user and all associated data
    await User.findByIdAndDelete(userId);

    // Note: In a real application, you would also delete all associated data
    // like mood entries, journal entries, chat messages, etc.

    const response: ApiResponse = {
      success: true,
      message: "Account deleted successfully",
    };

    res.json(response);
  }
);

// Get user dashboard data
export const getDashboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Get insights
    const insights = await analyticsService.getInsights(userId);

    // Get recent activity (placeholder - would be implemented with actual data)
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

    const response: ApiResponse = {
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
  }
);

// Get user statistics
export const getUserStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    // Get mood analytics
    const moodAnalytics = await analyticsService.getMoodAnalytics(userId, days);

    // Get journal analytics
    const journalAnalytics = await analyticsService.getJournalAnalytics(
      userId,
      days
    );

    // Get session statistics (placeholder - would be implemented with actual data)
    const sessionStats = {
      totalSessions: 0,
      completedSessions: 0,
      averageMood: 0,
    };

    const response: ApiResponse = {
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
  }
);

// Update user preferences
export const updatePreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { preferences } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences: { ...req.user.preferences, ...preferences } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new CustomError("User not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Preferences updated successfully",
      data: {
        preferences: user.preferences,
      },
    };

    res.json(response);
  }
);

// Get user activity summary
export const getActivitySummary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get activity counts (placeholder - would be implemented with actual data)
    const activitySummary = {
      moodEntries: 0,
      journalEntries: 0,
      chatMessages: 0,
      completedSessions: 0,
      totalDays: days,
      activeDays: 0,
    };

    const response: ApiResponse = {
      success: true,
      message: "Activity summary retrieved successfully",
      data: {
        summary: activitySummary,
        period: `${days} days`,
      },
    };

    res.json(response);
  }
);

// Get user goals (placeholder)
export const getGoals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const response: ApiResponse = {
      success: true,
      message: "Goals retrieved successfully",
      data: goals,
    };

    res.json(response);
  }
);

// Update user goal
export const updateGoal = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { goalId } = req.params;
    const { completed, progress } = req.body;

    // This would typically update a goals collection
    // For now, return a placeholder response
    const response: ApiResponse = {
      success: true,
      message: "Goal updated successfully",
    };

    res.json(response);
  }
);
