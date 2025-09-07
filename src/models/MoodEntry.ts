import mongoose, { Document, Schema } from "mongoose";
import { MoodEntry as IMoodEntry, SentimentAnalysis } from "@/types";

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

const moodEntrySchema = new Schema<MoodEntryDocument>(
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
    mood: {
      type: Number,
      required: [true, "Mood rating is required"],
      min: [1, "Mood must be at least 1"],
      max: [10, "Mood cannot exceed 10"],
    },
    emotions: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Emotion cannot exceed 50 characters"],
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    voiceTranscript: {
      type: String,
      trim: true,
      maxlength: [5000, "Voice transcript cannot exceed 5000 characters"],
    },
    sentiment: {
      type: sentimentAnalysisSchema,
      required: true,
    },
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
moodEntrySchema.index({ userId: 1, timestamp: -1 });
moodEntrySchema.index({ userId: 1, mood: 1 });
moodEntrySchema.index({ userId: 1, "sentiment.label": 1 });
moodEntrySchema.index({ timestamp: -1 });

// Compound index for analytics queries
moodEntrySchema.index({ userId: 1, timestamp: -1, mood: 1 });

export const MoodEntry = mongoose.model<MoodEntryDocument>(
  "MoodEntry",
  moodEntrySchema
);
