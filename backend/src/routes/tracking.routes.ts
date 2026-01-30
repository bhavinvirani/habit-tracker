import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  logHabitCompletion,
  getTrackingHistory,
  deleteTrackingEntry,
} from '../controllers/tracking.controller';

const router = Router();

router.use(authenticate);

router.post('/', logHabitCompletion);
router.get('/:habitId', getTrackingHistory);
router.delete('/:id', deleteTrackingEntry);

export default router;
