import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { paginationSchema } from '@/middleware/validation';
import {
  logMood,
  getMoodEntries,
  getMoodAnalytics,
  getMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getMoodInsights,
  getMoodTrends,
  getEmotionFrequency,
} from '@/controllers/moodController';
import { moodLogSchema } from '@/middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Mood entry routes
router.post('/log', validate(moodLogSchema), logMood);
router.get('/entries', validateQuery(paginationSchema), getMoodEntries);
router.get('/analytics', getMoodAnalytics);
router.get('/insights', getMoodInsights);
router.get('/trends', getMoodTrends);
router.get('/emotions', getEmotionFrequency);
router.get('/:id', getMoodEntry);
router.put('/:id', validate(moodLogSchema), updateMoodEntry);
router.delete('/:id', deleteMoodEntry);

export default router;
