import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../types";
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateToken: (userId: string, email: string) => string;
export declare const verifyToken: (token: string) => JWTPayload;
//# sourceMappingURL=auth.d.ts.map