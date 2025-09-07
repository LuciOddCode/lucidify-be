import mongoose, { Document } from "mongoose";
export interface ChatSessionDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    messageCount: number;
    endSession(): void;
    incrementMessageCount(): void;
}
export declare const ChatSession: mongoose.Model<ChatSessionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ChatSessionDocument, {}, {}> & ChatSessionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatSession.d.ts.map