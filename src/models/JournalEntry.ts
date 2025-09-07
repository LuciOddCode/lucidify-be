import mongoose, { Document, Schema } from "mongoose";
import { JournalEntry as IJournalEntry, SentimentAnalysis } from "@/types";

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

const sentimentAnalysisSchema = new Schema<SentimentAnalysis>(
  {
    score: {
      type: Number,
      required: true,
      min: -1,
      max: 1,
    },
    label: {
      type: String,
      required: true,
      enum: ["positive", "negative", "neutral"],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const journalEntrySchema = new Schema<JournalEntryDocument>(
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
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters long"],
      maxlength: [10000, "Content cannot exceed 10000 characters"],
    },
    mood: {
      type: Number,
      min: [1, "Mood must be at least 1"],
      max: [10, "Mood cannot exceed 10"],
    },
    sentiment: {
      type: sentimentAnalysisSchema,
      required: true,
    },
    aiPrompt: {
      type: String,
      trim: true,
      maxlength: [500, "AI prompt cannot exceed 500 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
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
journalEntrySchema.index({ userId: 1, timestamp: -1 });
journalEntrySchema.index({ userId: 1, "sentiment.label": 1 });
journalEntrySchema.index({ userId: 1, tags: 1 });
journalEntrySchema.index({ timestamp: -1 });

// Text index for content search
journalEntrySchema.index({ content: "text" });

// Compound index for analytics queries
journalEntrySchema.index({ userId: 1, timestamp: -1, "sentiment.label": 1 });

export const JournalEntry = mongoose.model<JournalEntryDocument>(
  "JournalEntry",
  journalEntrySchema
);
