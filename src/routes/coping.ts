import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { paginationSchema } from '@/middleware/validation';
import {
  getCopingStrategies,
  getCopingStrategy,
  rateCopingStrategy,
  getPersonalizedSuggestions,
  getCopingStrategyTypes,
  getPopularStrategies,
  searchCopingStrategies,
  getCopingStrategiesByType,
  getCopingStrategyStats,
} from '@/controllers/copingController';
import { copingStrategyRateSchema } from '@/middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Coping strategy routes
router.get('/strategies', validateQuery(paginationSchema), getCopingStrategies);
router.get('/strategies/types', getCopingStrategyTypes);
router.get('/strategies/popular', getPopularStrategies);
router.get('/strategies/search', validateQuery(paginationSchema), searchCopingStrategies);
router.get('/strategies/type/:type', validateQuery(paginationSchema), getCopingStrategiesByType);
router.get('/strategies/stats', getCopingStrategyStats);
router.get('/suggestions', getPersonalizedSuggestions);
router.get('/:id', getCopingStrategy);
router.post('/:id/rate', validate(copingStrategyRateSchema), rateCopingStrategy);

export default router;
