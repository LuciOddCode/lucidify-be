import mongoose, { Document } from "mongoose";
export interface CopingStrategyDocument extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: "mindfulness" | "cbt" | "gratitude" | "breathing" | "grounding";
    steps: string[];
    duration: number;
    rating: number;
    personalized: boolean;
    createdAt: Date;
    updateRating(newRating: number): void;
}
export declare const CopingStrategy: mongoose.Model<CopingStrategyDocument, {}, {}, {}, mongoose.Document<unknown, {}, CopingStrategyDocument, {}, {}> & CopingStrategyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CopingStrategy.d.ts.map