"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const chatController_1 = require("../controllers/chatController");
const validation_3 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/chat', rateLimiter_1.aiChatLimiter, (0, validation_1.validate)(validation_3.chatSchema), chatController_1.sendMessage);
router.get('/chat/sessions', (0, validation_1.validateQuery)(validation_2.paginationSchema), chatController_1.getChatSessions);
router.get('/chat/sessions/:sessionId', chatController_1.getChatHistory);
router.post('/chat/sessions/:sessionId/end', chatController_1.endChatSession);
router.delete('/chat/sessions/:sessionId', chatController_1.deleteChatSession);
router.get('/chat/suggestions', chatController_1.getChatSuggestions);
router.get('/chat/analytics', chatController_1.getChatAnalytics);
router.get('/chat/insights', chatController_1.getChatInsights);
exports.default = router;
//# sourceMappingURL=ai.js.map