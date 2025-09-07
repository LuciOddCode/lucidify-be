import mongoose, { Document } from "mongoose";
export interface MoodEntryDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mood: number;
    emotions: string[];
    notes?: string;
    voiceTranscript?: string;
    sentiment: {
        score: number;
        label: "positive" | "negative" | "neutral";
        confidence: number;
    };
    timestamp: Date;
}
export declare const MoodEntry: mongoose.Model<MoodEntryDocument, {}, {}, {}, mongoose.Document<unknown, {}, MoodEntryDocument, {}, {}> & MoodEntryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MoodEntry.d.ts.map