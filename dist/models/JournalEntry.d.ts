import mongoose, { Document } from "mongoose";
export interface JournalEntryDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    mood?: number;
    sentiment: {
        score: number;
        label: "positive" | "negative" | "neutral";
        confidence: number;
    };
    aiPrompt?: string;
    tags: string[];
    timestamp: Date;
}
export declare const JournalEntry: mongoose.Model<JournalEntryDocument, {}, {}, {}, mongoose.Document<unknown, {}, JournalEntryDocument, {}, {}> & JournalEntryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=JournalEntry.d.ts.map