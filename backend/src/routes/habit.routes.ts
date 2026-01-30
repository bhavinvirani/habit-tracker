import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} from '../controllers/habit.controller';

const router = Router();

router.use(authenticate);

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

export default router;
