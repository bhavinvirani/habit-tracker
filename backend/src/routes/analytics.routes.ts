import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getOverview,
  getHabitStats,
  getTrends,
} from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/habits/:id/stats', getHabitStats);
router.get('/trends', getTrends);

export default router;
