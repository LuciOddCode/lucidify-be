import mongoose, { Document, Schema } from "mongoose";
import { ChatSession as IChatSession } from "@/types";

export interface ChatSessionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  endSession(): void;
  incrementMessageCount(): void;
}

const chatSessionSchema = new Schema<ChatSessionDocument>(
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
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: [0, "Message count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
chatSessionSchema.index({ userId: 1, startTime: -1 });
chatSessionSchema.index({ userId: 1, endTime: -1 });
chatSessionSchema.index({ startTime: -1 });

// Method to end session
chatSessionSchema.methods.endSession = function () {
  this.endTime = new Date();
  return this.save();
};

// Method to increment message count
chatSessionSchema.methods.incrementMessageCount = function () {
  this.messageCount += 1;
  return this.save();
};

export const ChatSession = mongoose.model<ChatSessionDocument>(
  "ChatSession",
  chatSessionSchema
);
