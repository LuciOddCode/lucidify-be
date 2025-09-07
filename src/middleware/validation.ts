import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "@/types";

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&(),.?":{}|<>])/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "Password is required",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const moodLogSchema = Joi.object({
  mood: Joi.number().integer().min(1).max(10).required().messages({
    "number.min": "Mood must be at least 1",
    "number.max": "Mood cannot exceed 10",
    "any.required": "Mood rating is required",
  }),
  emotions: Joi.array().items(Joi.string().max(50)).max(10).messages({
    "array.max": "Cannot select more than 10 emotions",
    "string.max": "Emotion cannot exceed 50 characters",
  }),
  notes: Joi.string().max(1000).optional().messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
  voiceTranscript: Joi.string().max(5000).optional().messages({
    "string.max": "Voice transcript cannot exceed 5000 characters",
  }),
});

export const journalCreateSchema = Joi.object({
  content: Joi.string().min(10).max(10000).required().messages({
    "string.min": "Content must be at least 10 characters long",
    "string.max": "Content cannot exceed 10000 characters",
    "any.required": "Content is required",
  }),
  mood: Joi.number().integer().min(1).max(10).optional().messages({
    "number.min": "Mood must be at least 1",
    "number.max": "Mood cannot exceed 10",
  }),
});

export const chatSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message is required",
  }),
  sessionId: Joi.string().optional().messages({
    "string.base": "Session ID must be a string",
  }),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string().max(100).optional().messages({
    "string.max": "Name cannot exceed 100 characters",
  }),
  preferences: Joi.object({
    language: Joi.string().valid("en", "si", "ta").optional(),
    aiSummarization: Joi.boolean().optional(),
    anonymousMode: Joi.boolean().optional(),
    dataConsent: Joi.boolean().optional(),
    trustedContact: Joi.object({
      name: Joi.string().max(100).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().max(20).optional(),
    }).optional(),
  }).optional(),
});

export const trustedContactSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string().max(20).optional().messages({
    "string.max": "Phone number cannot exceed 20 characters",
  }),
});

export const copingStrategyRateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),
});

export const sessionStepUpdateSchema = Joi.object({
  data: Joi.any().optional(),
});

export const sessionCompleteSchema = Joi.object({
  overallMood: Joi.number().integer().min(1).max(10).optional().messages({
    "number.min": "Overall mood must be at least 1",
    "number.max": "Overall mood cannot exceed 10",
  }),
  summary: Joi.string().max(1000).optional().messages({
    "string.max": "Summary cannot exceed 1000 characters",
  }),
});

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details[0].message;
      const field = error.details[0].path[0] as string;

      const appError: AppError = new Error(errorMessage) as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;
      appError.field = field;

      return next(appError);
    }

    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details[0].message;

      const appError: AppError = new Error(errorMessage) as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;

      return next(appError);
    }

    next();
  };
};

// Pagination query schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
