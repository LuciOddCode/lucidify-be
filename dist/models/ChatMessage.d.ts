import mongoose, { Document } from "mongoose";
export interface ChatMessageDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    sessionId: string;
    content: string;
    isUser: boolean;
    suggestions?: string[];
    timestamp: Date;
}
export declare const ChatMessage: mongoose.Model<ChatMessageDocument, {}, {}, {}, mongoose.Document<unknown, {}, ChatMessageDocument, {}, {}> & ChatMessageDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatMessage.d.ts.map