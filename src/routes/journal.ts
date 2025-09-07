import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { paginationSchema } from '@/middleware/validation';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getAIPrompt,
  getJournalAnalytics,
  searchJournalEntries,
  getJournalInsights,
  getCommonThemes,
  getSentimentDistribution,
} from '@/controllers/journalController';
import { journalCreateSchema } from '@/middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Journal entry routes
router.post('/create', validate(journalCreateSchema), createJournalEntry);
router.get('/entries', validateQuery(paginationSchema), getJournalEntries);
router.get('/analytics', getJournalAnalytics);
router.get('/insights', getJournalInsights);
router.get('/themes', getCommonThemes);
router.get('/sentiment', getSentimentDistribution);
router.get('/search', validateQuery(paginationSchema), searchJournalEntries);
router.get('/ai-prompt', getAIPrompt);
router.get('/:id', getJournalEntry);
router.put('/:id', validate(journalCreateSchema), updateJournalEntry);
router.delete('/:id', deleteJournalEntry);

export default router;
