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
exports.EightMinuteSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const sessionStepSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
    },
}, { _id: false });
const eightMinuteSessionSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: () => new mongoose_1.default.Types.ObjectId(),
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
eightMinuteSessionSchema.index({ userId: 1, startTime: -1 });
eightMinuteSessionSchema.index({ userId: 1, completed: 1 });
eightMinuteSessionSchema.index({ startTime: -1 });
eightMinuteSessionSchema.methods.completeSession = function (overallMood, summary) {
    this.endTime = new Date();
    this.completed = true;
    if (overallMood)
        this.overallMood = overallMood;
    if (summary)
        this.summary = summary;
    return this.save();
};
eightMinuteSessionSchema.methods.updateStep = function (stepId, data) {
    const step = this.steps.find((s) => s.id === stepId);
    if (step) {
        step.completed = true;
        step.data = data;
        return this.save();
    }
    throw new Error("Step not found");
};
eightMinuteSessionSchema.methods.getCompletionPercentage = function () {
    if (this.steps.length === 0)
        return 0;
    const completedSteps = this.steps.filter((step) => step.completed).length;
    return Math.round((completedSteps / this.steps.length) * 100);
};
exports.EightMinuteSession = mongoose_1.default.model("EightMinuteSession", eightMinuteSessionSchema);
//# sourceMappingURL=EightMinuteSession.js.map