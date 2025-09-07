"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            const error = new Error("Access token required");
            error.statusCode = 401;
            error.isOperational = true;
            throw error;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            const error = new Error("JWT secret not configured");
            error.statusCode = 500;
            error.isOperational = true;
            throw error;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await User_1.User.findById(decoded.userId).select("-password");
        if (!user) {
            const error = new Error("Invalid token - user not found");
            error.statusCode = 401;
            error.isOperational = true;
            throw error;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            const appError = new Error("Invalid token");
            appError.statusCode = 401;
            appError.isOperational = true;
            return next(appError);
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            const appError = new Error("Token expired");
            appError.statusCode = 401;
            appError.isOperational = true;
            return next(appError);
        }
        console.error("Auth middleware error:", error);
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
const generateToken = (userId, email) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";
    if (!jwtSecret) {
        throw new Error("JWT secret not configured");
    }
    return jsonwebtoken_1.default.sign({ userId, email }, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT secret not configured");
    }
    return jsonwebtoken_1.default.verify(token, jwtSecret);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.js.map