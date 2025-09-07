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
exports.JournalEntry = void 0;
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
const journalEntrySchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: () => new mongoose_1.default.Types.ObjectId(),
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
journalEntrySchema.index({ userId: 1, timestamp: -1 });
journalEntrySchema.index({ userId: 1, "sentiment.label": 1 });
journalEntrySchema.index({ userId: 1, tags: 1 });
journalEntrySchema.index({ timestamp: -1 });
journalEntrySchema.index({ content: "text" });
journalEntrySchema.index({ userId: 1, timestamp: -1, "sentiment.label": 1 });
exports.JournalEntry = mongoose_1.default.model("JournalEntry", journalEntrySchema);
//# sourceMappingURL=JournalEntry.js.map