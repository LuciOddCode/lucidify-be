import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    field?: string;
    constructor(message: string, statusCode: number, isOperational?: boolean, field?: string);
}
export declare const errorHandler: (error: Error | AppError | CustomError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const handleValidationError: (error: any) => CustomError;
export declare const handleJWTError: () => CustomError;
export declare const handleJWTExpiredError: () => CustomError;
export declare const handleDuplicateFieldsDB: (error: any) => CustomError;
export declare const handleCastErrorDB: (error: any) => CustomError;
//# sourceMappingURL=errorHandler.d.ts.map