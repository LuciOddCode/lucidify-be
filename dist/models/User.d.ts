import mongoose, { Document } from "mongoose";
import { User as IUser, UserPreferences } from "../types";
export interface UserDocument extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    name?: string;
    preferences: UserPreferences;
    googleId?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): IUser;
}
export declare const User: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}, {}> & UserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map