import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { User as IUser, UserPreferences } from "@/types";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name?: string;
  preferences: UserPreferences;
  googleId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): IUser;
}

const userPreferencesSchema = new Schema<UserPreferences>(
  {
    language: {
      type: String,
      enum: ["en", "si", "ta"],
      default: "en",
    },
    aiSummarization: {
      type: Boolean,
      default: true,
    },
    anonymousMode: {
      type: Boolean,
      default: false,
    },
    dataConsent: {
      type: Boolean,
      default: true,
    },
    trustedContact: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ "preferences.language": 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

export const User = mongoose.model<UserDocument>("User", userSchema);
