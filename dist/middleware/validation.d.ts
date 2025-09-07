import { Request, Response, NextFunction } from "express";
import Joi from "joi";
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const moodLogSchema: Joi.ObjectSchema<any>;
export declare const journalCreateSchema: Joi.ObjectSchema<any>;
export declare const chatSchema: Joi.ObjectSchema<any>;
export declare const profileUpdateSchema: Joi.ObjectSchema<any>;
export declare const trustedContactSchema: Joi.ObjectSchema<any>;
export declare const copingStrategyRateSchema: Joi.ObjectSchema<any>;
export declare const sessionStepUpdateSchema: Joi.ObjectSchema<any>;
export declare const sessionCompleteSchema: Joi.ObjectSchema<any>;
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const paginationSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map