import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import * as habitService from '../services/habit.service';
import { GetHabitsQuery } from '../validators/habit.validator';

/**
 * Create a new habit
 * POST /api/habits
 */
export const createHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habit = await habitService.createHabit(req.userId!, req.body);

  sendCreated(res, { habit }, 'Habit created successfully! 🎯');
});

/**
 * Get all habits for the authenticated user
 * GET /api/habits
 */
export const getHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query as unknown as GetHabitsQuery;

  const habits = await habitService.getHabits({
    userId: req.userId!,
    isActive: query.isActive,
    isArchived: query.isArchived,
    category: query.category,
    frequency: query.frequency,
  });

  sendSuccess(res, { habits }, 'Habits retrieved successfully');
});

/**
 * Get a single habit by ID
 * GET /api/habits/:id
 */
export const getHabitById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habitId = req.params.id as string;
  const habit = await habitService.getHabitById(habitId, req.userId!);

  sendSuccess(res, { habit }, 'Habit retrieved successfully');
});

/**
 * Update a habit
 * PATCH /api/habits/:id
 */
export const updateHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habitId = req.params.id as string;
  const habit = await habitService.updateHabit(habitId, req.userId!, req.body);

  sendSuccess(res, { habit }, 'Habit updated successfully');
});

/**
 * Delete a habit
 * DELETE /api/habits/:id
 */
export const deleteHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habitId = req.params.id as string;
  await habitService.deleteHabit(habitId, req.userId!);

  sendSuccess(res, { deletedId: habitId }, 'Habit deleted successfully');
});

/**
 * Archive a habit
 * POST /api/habits/:id/archive
 */
export const archiveHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habitId = req.params.id as string;
  const habit = await habitService.archiveHabit(habitId, req.userId!);

  sendSuccess(res, { habit }, 'Habit archived successfully');
});

/**
 * Unarchive a habit
 * POST /api/habits/:id/unarchive
 */
export const unarchiveHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habitId = req.params.id as string;
  const habit = await habitService.unarchiveHabit(habitId, req.userId!);

  sendSuccess(res, { habit }, 'Habit restored successfully');
});

/**
 * Get all archived habits
 * GET /api/habits/archived
 */
export const getArchivedHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const habits = await habitService.getArchivedHabits(req.userId!);

  sendSuccess(res, { habits }, 'Archived habits retrieved successfully');
});

/**
 * Reorder habits
 * PATCH /api/habits/reorder
 */
export const reorderHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  await habitService.reorderHabits(req.userId!, req.body.habitIds);

  sendSuccess(res, null, 'Habits reordered successfully');
});

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await habitService.getCategories(req.userId!);

  sendSuccess(
    res,
    {
      categories,
      defaultCategories: habitService.DEFAULT_CATEGORIES,
    },
    'Categories retrieved successfully'
  );
});
