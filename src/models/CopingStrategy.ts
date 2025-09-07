import mongoose, { Document, Schema } from "mongoose";
import { CopingStrategy as ICopingStrategy } from "@/types";

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

const copingStrategySchema = new Schema<CopingStrategyDocument>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["mindfulness", "cbt", "gratitude", "breathing", "grounding"],
    },
    steps: [
      {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, "Step cannot exceed 200 characters"],
      },
    ],
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [60, "Duration cannot exceed 60 minutes"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    personalized: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
copingStrategySchema.index({ type: 1 });
copingStrategySchema.index({ rating: -1 });
copingStrategySchema.index({ personalized: 1 });
copingStrategySchema.index({ createdAt: -1 });

// Text index for search
copingStrategySchema.index({ title: "text", description: "text" });

// Method to update rating
copingStrategySchema.methods.updateRating = function (newRating: number) {
  // Calculate new average rating
  const currentTotal = this.rating * (this.ratingCount || 0);
  const newTotal = currentTotal + newRating;
  const newCount = (this.ratingCount || 0) + 1;

  this.rating = newTotal / newCount;
  this.ratingCount = newCount;

  return this.save();
};

export const CopingStrategy = mongoose.model<CopingStrategyDocument>(
  "CopingStrategy",
  copingStrategySchema
);
