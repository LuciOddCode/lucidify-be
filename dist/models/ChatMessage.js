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
exports.ChatMessage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const chatMessageSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: () => new mongoose_1.default.Types.ObjectId(),
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "User ID is required"],
        ref: "User",
    },
    sessionId: {
        type: String,
        required: [true, "Session ID is required"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        maxlength: [2000, "Content cannot exceed 2000 characters"],
    },
    isUser: {
        type: Boolean,
        required: [true, "isUser flag is required"],
    },
    suggestions: [
        {
            type: String,
            trim: true,
            maxlength: [100, "Suggestion cannot exceed 100 characters"],
        },
    ],
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
chatMessageSchema.index({ userId: 1, sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ userId: 1, timestamp: -1 });
exports.ChatMessage = mongoose_1.default.model("ChatMessage", chatMessageSchema);
//# sourceMappingURL=ChatMessage.js.map