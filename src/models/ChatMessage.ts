import mongoose, { Document, Schema } from "mongoose";
import { ChatMessage as IChatMessage } from "@/types";

export interface ChatMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  content: string;
  isUser: boolean;
  suggestions?: string[];
  timestamp: Date;
}

const chatMessageSchema = new Schema<ChatMessageDocument>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User",
    },
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },
    isUser: {
      type: Boolean,
      required: [true, "isUser flag is required"],
    },
    suggestions: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Suggestion cannot exceed 100 characters"],
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
chatMessageSchema.index({ userId: 1, sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model<ChatMessageDocument>(
  "ChatMessage",
  chatMessageSchema
);
