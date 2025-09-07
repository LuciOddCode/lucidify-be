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
exports.ChatSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const chatSessionSchema = new mongoose_1.Schema({
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
    messageCount: {
        type: Number,
        default: 0,
        min: [0, "Message count cannot be negative"],
    },
}, {
    timestamps: true,
});
chatSessionSchema.index({ userId: 1, startTime: -1 });
chatSessionSchema.index({ userId: 1, endTime: -1 });
chatSessionSchema.index({ startTime: -1 });
chatSessionSchema.methods.endSession = function () {
    this.endTime = new Date();
    return this.save();
};
chatSessionSchema.methods.incrementMessageCount = function () {
    this.messageCount += 1;
    return this.save();
};
exports.ChatSession = mongoose_1.default.model("ChatSession", chatSessionSchema);
//# sourceMappingURL=ChatSession.js.map