import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createHabitSchema,
  updateHabitSchema,
  reorderHabitsSchema,
  getHabitsQuerySchema,
} from '../validators/habit.validator';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  archiveHabit,
  unarchiveHabit,
  getArchivedHabits,
  reorderHabits,
  getCategories,
} from '../controllers/habit.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Categories
router.get('/categories', getCategories);

// Archived habits (must come before :id route)
router.get('/archived', getArchivedHabits);

// Reorder habits
router.patch('/reorder', validateBody(reorderHabitsSchema), reorderHabits);

// CRUD operations
router.post('/', validateBody(createHabitSchema), createHabit);
router.get('/', validateQuery(getHabitsQuerySchema), getHabits);
router.get('/:id', getHabitById);
router.patch('/:id', validateBody(updateHabitSchema), updateHabit);
router.delete('/:id', deleteHabit);

// Archive/Unarchive
router.post('/:id/archive', archiveHabit);
router.post('/:id/unarchive', unarchiveHabit);

export default router;
