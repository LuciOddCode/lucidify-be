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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userPreferencesSchema = new mongoose_1.Schema({
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
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: () => new mongoose_1.default.Types.ObjectId(),
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
        select: false,
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
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        },
    },
});
userSchema.index({ email: 1 });
userSchema.index({ "preferences.language": 1 });
userSchema.index({ createdAt: -1 });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password)
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return await bcryptjs_1.default.compare(candidatePassword, this.password);
};
userSchema.methods.updateLastLogin = function () {
    this.lastLoginAt = new Date();
    return this.save();
};
exports.User = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=User.js.map