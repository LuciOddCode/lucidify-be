"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.validateQuery = exports.validate = exports.sessionCompleteSchema = exports.sessionStepUpdateSchema = exports.copingStrategyRateSchema = exports.trustedContactSchema = exports.profileUpdateSchema = exports.chatSchema = exports.journalCreateSchema = exports.moodLogSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&(),.?":{}|<>])/)
        .required()
        .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
    }),
    confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required().messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().required().messages({
        "any.required": "Password is required",
    }),
});
exports.moodLogSchema = joi_1.default.object({
    mood: joi_1.default.number().integer().min(1).max(10).required().messages({
        "number.min": "Mood must be at least 1",
        "number.max": "Mood cannot exceed 10",
        "any.required": "Mood rating is required",
    }),
    emotions: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).messages({
        "array.max": "Cannot select more than 10 emotions",
        "string.max": "Emotion cannot exceed 50 characters",
    }),
    notes: joi_1.default.string().max(1000).optional().messages({
        "string.max": "Notes cannot exceed 1000 characters",
    }),
    voiceTranscript: joi_1.default.string().max(5000).optional().messages({
        "string.max": "Voice transcript cannot exceed 5000 characters",
    }),
});
exports.journalCreateSchema = joi_1.default.object({
    content: joi_1.default.string().min(10).max(10000).required().messages({
        "string.min": "Content must be at least 10 characters long",
        "string.max": "Content cannot exceed 10000 characters",
        "any.required": "Content is required",
    }),
    mood: joi_1.default.number().integer().min(1).max(10).optional().messages({
        "number.min": "Mood must be at least 1",
        "number.max": "Mood cannot exceed 10",
    }),
});
exports.chatSchema = joi_1.default.object({
    message: joi_1.default.string().min(1).max(2000).required().messages({
        "string.min": "Message cannot be empty",
        "string.max": "Message cannot exceed 2000 characters",
        "any.required": "Message is required",
    }),
    sessionId: joi_1.default.string().optional().messages({
        "string.base": "Session ID must be a string",
    }),
});
exports.profileUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().max(100).optional().messages({
        "string.max": "Name cannot exceed 100 characters",
    }),
    preferences: joi_1.default.object({
        language: joi_1.default.string().valid("en", "si", "ta").optional(),
        aiSummarization: joi_1.default.boolean().optional(),
        anonymousMode: joi_1.default.boolean().optional(),
        dataConsent: joi_1.default.boolean().optional(),
        trustedContact: joi_1.default.object({
            name: joi_1.default.string().max(100).required(),
            email: joi_1.default.string().email().required(),
            phone: joi_1.default.string().max(20).optional(),
        }).optional(),
    }).optional(),
});
exports.trustedContactSchema = joi_1.default.object({
    name: joi_1.default.string().max(100).required().messages({
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Name is required",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
    phone: joi_1.default.string().max(20).optional().messages({
        "string.max": "Phone number cannot exceed 20 characters",
    }),
});
exports.copingStrategyRateSchema = joi_1.default.object({
    rating: joi_1.default.number().integer().min(1).max(5).required().messages({
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "any.required": "Rating is required",
    }),
});
exports.sessionStepUpdateSchema = joi_1.default.object({
    data: joi_1.default.any().optional(),
});
exports.sessionCompleteSchema = joi_1.default.object({
    overallMood: joi_1.default.number().integer().min(1).max(10).optional().messages({
        "number.min": "Overall mood must be at least 1",
        "number.max": "Overall mood cannot exceed 10",
    }),
    summary: joi_1.default.string().max(1000).optional().messages({
        "string.max": "Summary cannot exceed 1000 characters",
    }),
});
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details[0].message;
            const field = error.details[0].path[0];
            const appError = new Error(errorMessage);
            appError.statusCode = 400;
            appError.isOperational = true;
            appError.field = field;
            return next(appError);
        }
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const errorMessage = error.details[0].message;
            const appError = new Error(errorMessage);
            appError.statusCode = 400;
            appError.isOperational = true;
            return next(appError);
        }
        next();
    };
};
exports.validateQuery = validateQuery;
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
});
//# sourceMappingURL=validation.js.map