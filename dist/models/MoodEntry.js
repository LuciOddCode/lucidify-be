"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const sentimentAnalysisSchema = new mongoose_1.Schema({
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
}, { _id: false });
const moodEntrySchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: () => new mongoose_1.default.Types.ObjectId(),
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
moodEntrySchema.index({ userId: 1, timestamp: -1 });
moodEntrySchema.index({ userId: 1, mood: 1 });
moodEntrySchema.index({ userId: 1, "sentiment.label": 1 });
moodEntrySchema.index({ timestamp: -1 });
moodEntrySchema.index({ userId: 1, timestamp: -1, mood: 1 });
exports.MoodEntry = mongoose_1.default.model("MoodEntry", moodEntrySchema);
//# sourceMappingURL=MoodEntry.js.map