import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { paginationSchema } from '@/middleware/validation';
import { aiChatLimiter } from '@/middleware/rateLimiter';
import {
  sendMessage,
  getChatHistory,
  getChatSessions,
  endChatSession,
  deleteChatSession,
  getChatSuggestions,
  getChatAnalytics,
  getChatInsights,
} from '@/controllers/chatController';
import { chatSchema } from '@/middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Chat routes
router.post('/chat', aiChatLimiter, validate(chatSchema), sendMessage);
router.get('/chat/sessions', validateQuery(paginationSchema), getChatSessions);
router.get('/chat/sessions/:sessionId', getChatHistory);
router.post('/chat/sessions/:sessionId/end', endChatSession);
router.delete('/chat/sessions/:sessionId', deleteChatSession);
router.get('/chat/suggestions', getChatSuggestions);
router.get('/chat/analytics', getChatAnalytics);
router.get('/chat/insights', getChatInsights);

export default router;
