import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { JWTPayload, AppError } from "@/types";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      const error: AppError = new Error("Access token required") as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      const error: AppError = new Error(
        "JWT secret not configured"
      ) as AppError;
      error.statusCode = 500;
      error.isOperational = true;
      throw error;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      const error: AppError = new Error(
        "Invalid token - user not found"
      ) as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const appError: AppError = new Error("Invalid token") as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      return next(appError);
    }

    if (error instanceof jwt.TokenExpiredError) {
      const appError: AppError = new Error("Token expired") as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      return next(appError);
    }

    console.error("Auth middleware error:", error);
    next(error);
  }
};

export const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";

  if (!jwtSecret) {
    throw new Error("JWT secret not configured");
  }

  return jwt.sign({ userId, email }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT secret not configured");
  }

  return jwt.verify(token, jwtSecret) as JWTPayload;
};
