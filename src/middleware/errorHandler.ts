import { Request, Response, NextFunction } from "express";
import { AppError } from "@/types";
import { ApiResponse } from "@/types";

// Declare Node.js globals
declare const process: {
  env: {
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};

declare const console: {
  error: (message?: any, ...optionalParams: any[]) => void;
};

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  field?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    field?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.field = field;

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

// Global error handler
export const errorHandler = (
  error: Error | AppError | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Something went wrong. Please try again.";
  let field: string | undefined;

  // Handle custom errors
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
    field = error.field;
  }
  // Handle operational errors
  else if ("isOperational" in error && error.isOperational) {
    const appError = error as AppError;
    statusCode = appError.statusCode || 500;
    message = appError.message;
    field = appError.field;
  }
  // Handle validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
  }
  // Handle JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  // Handle MongoDB duplicate key errors
  else if (error.name === "MongoError" && (error as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate entry found";
  }
  // Handle MongoDB cast errors
  else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }
  // Handle MongoDB validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values((error as any).errors)
      .map((err: any) => err.message)
      .join(", ");
  }

  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
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

  // Send error response
  const response: ApiResponse = {
    success: false,
    message,
    ...(field && { field }),
  };

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (error: any): CustomError => {
  const errors = Object.values(error.errors).map((err: any) => err.message);
  return new CustomError(errors.join(", "), 400, true);
};

// JWT error handler
export const handleJWTError = (): CustomError => {
  return new CustomError("Invalid token. Please log in again.", 401);
};

export const handleJWTExpiredError = (): CustomError => {
  return new CustomError("Your token has expired. Please log in again.", 401);
};

// MongoDB error handlers
export const handleDuplicateFieldsDB = (error: any): CustomError => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new CustomError(message, 400);
};

export const handleCastErrorDB = (error: any): CustomError => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new CustomError(message, 400);
};
