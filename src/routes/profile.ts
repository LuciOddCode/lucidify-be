import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { paginationSchema } from '@/middleware/validation';
import {
  getProfile,
  updateProfile,
  setTrustedContact,
  testTrustedContact,
  exportData,
  deleteAccount,
  getDashboard,
  getUserStats,
  updatePreferences,
  getActivitySummary,
  getGoals,
  updateGoal,
} from '@/controllers/profileController';
import { profileUpdateSchema, trustedContactSchema } from '@/middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/', getProfile);
router.put('/', validate(profileUpdateSchema), updateProfile);
router.get('/dashboard', getDashboard);
router.get('/stats', getUserStats);
router.get('/activity', getActivitySummary);
router.get('/goals', getGoals);
router.put('/goals/:goalId', updateGoal);
router.put('/preferences', updatePreferences);
router.post('/trusted-contact', validate(trustedContactSchema), setTrustedContact);
router.post('/trusted-contact/test', testTrustedContact);
router.get('/export', exportData);
router.delete('/account', deleteAccount);

export default router;
