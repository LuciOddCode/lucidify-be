import { Request, Response, NextFunction } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => void;
export declare const login: (req: Request, res: Response, next: NextFunction) => void;
export declare const googleAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: NextFunction) => void;
export declare const getProfile: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateProfile: (req: Request, res: Response, next: NextFunction) => void;
export declare const setTrustedContact: (req: Request, res: Response, next: NextFunction) => void;
export declare const testTrustedContact: (req: Request, res: Response, next: NextFunction) => void;
export declare const exportData: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteAccount: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authController.d.ts.map