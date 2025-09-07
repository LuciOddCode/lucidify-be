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
exports.CopingStrategy = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const copingStrategySchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: () => new mongoose_1.default.Types.ObjectId(),
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
}, {
    timestamps: true,
});
copingStrategySchema.index({ type: 1 });
copingStrategySchema.index({ rating: -1 });
copingStrategySchema.index({ personalized: 1 });
copingStrategySchema.index({ createdAt: -1 });
copingStrategySchema.index({ title: "text", description: "text" });
copingStrategySchema.methods.updateRating = function (newRating) {
    const currentTotal = this.rating * (this.ratingCount || 0);
    const newTotal = currentTotal + newRating;
    const newCount = (this.ratingCount || 0) + 1;
    this.rating = newTotal / newCount;
    this.ratingCount = newCount;
    return this.save();
};
exports.CopingStrategy = mongoose_1.default.model("CopingStrategy", copingStrategySchema);
//# sourceMappingURL=CopingStrategy.js.map