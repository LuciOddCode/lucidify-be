import { Request, Response, NextFunction } from "express";
import { CopingStrategy } from "@/models/CopingStrategy";
import { ApiResponse, PaginatedResponse } from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { getGeminiService } from "@/services/geminiService";

// Get coping strategies
export const getCopingStrategies = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (type) {
      query.type = type;
    }

    // Get total count
    const total = await CopingStrategy.countDocuments(query);

    // Get strategies
    const strategies = await CopingStrategy.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof strategies)[0]> = {
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
  }
);

// Get coping strategy by ID
export const getCopingStrategy = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const strategy = await CopingStrategy.findById(id);

    if (!strategy) {
      throw new CustomError("Coping strategy not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Coping strategy retrieved successfully",
      data: strategy,
    };

    res.json(response);
  }
);

// Rate coping strategy
export const rateCopingStrategy = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { rating } = req.body;

    const strategy = await CopingStrategy.findById(id);

    if (!strategy) {
      throw new CustomError("Coping strategy not found", 404, true);
    }

    // Update rating
    await strategy.updateRating(rating);

    const response: ApiResponse = {
      success: true,
      message: "Coping strategy rated successfully",
    };

    res.json(response);
  }
);

// Get personalized coping suggestions
export const getPersonalizedSuggestions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { mood, emotions } = req.query;

    if (!mood || !emotions) {
      throw new CustomError("Mood and emotions are required", 400, true);
    }

    const moodValue = parseInt(mood as string);
    const emotionsArray = (emotions as string).split(",");

    // Get AI-generated suggestions
    const suggestions = await getGeminiService().generateCopingSuggestions(
      moodValue,
      emotionsArray,
      req.user.preferences.language
    );

    // Get relevant strategies from database
    const strategies = await CopingStrategy.find({
      $or: [
        { type: "mindfulness" },
        { type: "breathing" },
        { type: "grounding" },
      ],
    }).limit(5);

    const response: ApiResponse = {
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
  }
);

// Get coping strategy types
export const getCopingStrategyTypes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const response: ApiResponse = {
      success: true,
      message: "Coping strategy types retrieved successfully",
      data: types,
    };

    res.json(response);
  }
);

// Get popular coping strategies
export const getPopularStrategies = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 5;

    const strategies = await CopingStrategy.find({})
      .sort({ rating: -1 })
      .limit(limit);

    const response: ApiResponse = {
      success: true,
      message: "Popular coping strategies retrieved successfully",
      data: strategies,
    };

    res.json(response);
  }
);

// Search coping strategies
export const searchCopingStrategies = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      throw new CustomError("Search query is required", 400, true);
    }

    // Search in title and description
    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    // Get total count
    const total = await CopingStrategy.countDocuments(searchQuery);

    // Get strategies
    const strategies = await CopingStrategy.find(searchQuery)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof strategies)[0]> = {
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
  }
);

// Get coping strategy by type
export const getCopingStrategiesByType = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Validate type
    const validTypes = [
      "mindfulness",
      "cbt",
      "gratitude",
      "breathing",
      "grounding",
    ];
    if (!validTypes.includes(type)) {
      throw new CustomError("Invalid coping strategy type", 400, true);
    }

    // Get total count
    const total = await CopingStrategy.countDocuments({ type });

    // Get strategies
    const strategies = await CopingStrategy.find({ type })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof strategies)[0]> = {
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
  }
);

// Get coping strategy statistics
export const getCopingStrategyStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await CopingStrategy.aggregate([
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

    const totalStrategies = await CopingStrategy.countDocuments();
    const averageRating = await CopingStrategy.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const response: ApiResponse = {
      success: true,
      message: "Coping strategy statistics retrieved successfully",
      data: {
        totalStrategies,
        averageRating: averageRating[0]?.averageRating || 0,
        byType: stats,
      },
    };

    res.json(response);
  }
);
