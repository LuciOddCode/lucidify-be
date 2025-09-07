import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { paginationSchema } from '@/middleware/validation';
import {
  startSession,
  updateStep,
  completeSession,
  getSession,
  getUserSessions,
  getSessionAnalytics,
  getSessionInsights,
  getSessionTemplates,
} from '@/controllers/sessionController';
import { sessionStepUpdateSchema, sessionCompleteSchema } from '@/middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Session routes
router.post('/start', startSession);
router.get('/templates', getSessionTemplates);
router.get('/analytics', getSessionAnalytics);
router.get('/insights', getSessionInsights);
router.get('/user-sessions', validateQuery(paginationSchema), getUserSessions);
router.get('/:id', getSession);
router.put('/:id/step/:stepId', validate(sessionStepUpdateSchema), updateStep);
router.post('/:id/complete', validate(sessionCompleteSchema), completeSession);

export default router;
