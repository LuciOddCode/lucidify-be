"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastErrorDB = exports.handleDuplicateFieldsDB = exports.handleJWTExpiredError = exports.handleJWTError = exports.handleValidationError = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode, isOperational = true, field) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.field = field;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.CustomError = CustomError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong. Please try again.";
    let field;
    if (error instanceof CustomError) {
        statusCode = error.statusCode;
        message = error.message;
        field = error.field;
    }
    else if ("isOperational" in error && error.isOperational) {
        const appError = error;
        statusCode = appError.statusCode || 500;
        message = appError.message;
        field = appError.field;
    }
    else if (error.name === "ValidationError") {
        statusCode = 400;
        message = error.message;
    }
    else if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    else if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }
    else if (error.name === "MongoError" && error.code === 11000) {
        statusCode = 409;
        message = "Duplicate entry found";
    }
    else if (error.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    else if (error.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(error.errors)
            .map((err) => err.message)
            .join(", ");
    }
    if (process.env.NODE_ENV === "development") {
        console.error("Error:", {
            message: error.message,
            stack: error.stack,
            statusCode,
            url: req.url,
            method: req.method,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });
    }
    const response = {
        success: false,
        message,
        ...(field && { field }),
    };
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map((err) => err.message);
    return new CustomError(errors.join(", "), 400, true);
};
exports.handleValidationError = handleValidationError;
const handleJWTError = () => {
    return new CustomError("Invalid token. Please log in again.", 401);
};
exports.handleJWTError = handleJWTError;
const handleJWTExpiredError = () => {
    return new CustomError("Your token has expired. Please log in again.", 401);
};
exports.handleJWTExpiredError = handleJWTExpiredError;
const handleDuplicateFieldsDB = (error) => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value.`;
    return new CustomError(message, 400);
};
exports.handleDuplicateFieldsDB = handleDuplicateFieldsDB;
const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path}: ${error.value}.`;
    return new CustomError(message, 400);
};
exports.handleCastErrorDB = handleCastErrorDB;
//# sourceMappingURL=errorHandler.js.map