import mongoose, { Document, Schema } from "mongoose";
import {
  EightMinuteSession as IEightMinuteSession,
  SessionStep,
} from "@/types";

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

const sessionStepSchema = new Schema<SessionStep>(
  {
    id: {
      type: String,
      required: [true, "Step ID is required"],
    },
    title: {
      type: String,
      required: [true, "Step title is required"],
      trim: true,
      maxlength: [100, "Step title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Step description is required"],
      trim: true,
      maxlength: [500, "Step description cannot exceed 500 characters"],
    },
    duration: {
      type: Number,
      required: [true, "Step duration is required"],
      min: [1, "Step duration must be at least 1 minute"],
      max: [8, "Step duration cannot exceed 8 minutes"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const eightMinuteSessionSchema = new Schema<EightMinuteSessionDocument>(
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
    steps: [sessionStepSchema],
    overallMood: {
      type: Number,
      min: [1, "Overall mood must be at least 1"],
      max: [10, "Overall mood cannot exceed 10"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, "Summary cannot exceed 1000 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eightMinuteSessionSchema.index({ userId: 1, startTime: -1 });
eightMinuteSessionSchema.index({ userId: 1, completed: 1 });
eightMinuteSessionSchema.index({ startTime: -1 });

// Method to complete session
eightMinuteSessionSchema.methods.completeSession = function (
  overallMood?: number,
  summary?: string
) {
  this.endTime = new Date();
  this.completed = true;
  if (overallMood) this.overallMood = overallMood;
  if (summary) this.summary = summary;
  return this.save();
};

// Method to update step
eightMinuteSessionSchema.methods.updateStep = function (
  stepId: string,
  data: any
) {
  const step = this.steps.find((s: SessionStep) => s.id === stepId);
  if (step) {
    step.completed = true;
    step.data = data;
    return this.save();
  }
  throw new Error("Step not found");
};

// Method to get completion percentage
eightMinuteSessionSchema.methods.getCompletionPercentage = function (): number {
  if (this.steps.length === 0) return 0;
  const completedSteps = this.steps.filter(
    (step: SessionStep) => step.completed
  ).length;
  return Math.round((completedSteps / this.steps.length) * 100);
};

export const EightMinuteSession = mongoose.model<EightMinuteSessionDocument>(
  "EightMinuteSession",
  eightMinuteSessionSchema
);
