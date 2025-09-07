"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_1 = __importDefault(require("./routes/auth"));
const mood_1 = __importDefault(require("./routes/mood"));
const journal_1 = __importDefault(require("./routes/journal"));
const ai_1 = __importDefault(require("./routes/ai"));
const coping_1 = __importDefault(require("./routes/coping"));
const session_1 = __importDefault(require("./routes/session"));
const profile_1 = __importDefault(require("./routes/profile"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, database_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
app.use(rateLimiter_1.generalLimiter);
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Lucidify API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
app.use("/api/auth", auth_1.default);
app.use("/api/mood", mood_1.default);
app.use("/api/journal", journal_1.default);
app.use("/api/ai", ai_1.default);
app.use("/api/coping", coping_1.default);
app.use("/api/session", session_1.default);
app.use("/api/profile", profile_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    process.exit(0);
});
process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully...");
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=app.js.map