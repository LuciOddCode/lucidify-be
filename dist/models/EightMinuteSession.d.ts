import mongoose, { Document } from "mongoose";
export interface EightMinuteSessionDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    steps: {
        id: string;
        title: string;
        description: string;
        duration: number;
        completed: boolean;
        data?: any;
    }[];
    overallMood?: number;
    summary?: string;
    completed: boolean;
    completeSession(overallMood?: number, summary?: string): void;
    updateStep(stepId: string, data: any): void;
    getCompletionPercentage(): number;
}
export declare const EightMinuteSession: mongoose.Model<EightMinuteSessionDocument, {}, {}, {}, mongoose.Document<unknown, {}, EightMinuteSessionDocument, {}, {}> & EightMinuteSessionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=EightMinuteSession.d.ts.map