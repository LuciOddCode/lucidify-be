"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3001;
const server = app_1.default.listen(PORT, () => {
    console.log(`🚀 Lucidify API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map