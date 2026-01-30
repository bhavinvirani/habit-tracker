import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import logger from '../utils/logger';

export const createHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement create habit with database
  const { name, description, frequency, color } = req.body;

  logger.info('Habit creation requested', { userId: req.userId, name });

  // Mock habit data until implementation
  const habit = {
    id: 'temp-habit-id',
    name,
    description: description || null,
    frequency: frequency || 'daily',
    color: color || '#3B82F6',
    userId: req.userId,
    isActive: true,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sendCreated(res, { habit }, "Habit created successfully. Let's build this habit together!");
});

export const getHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement get habits from database with pagination and filters
  const { page = 1, limit = 20, status, frequency } = req.query;

  logger.debug('Fetching habits', { userId: req.userId, status, frequency });

  // Mock habits list until implementation
  const habits = [
    {
      id: 'habit-1',
      name: 'Morning Exercise',
      description: '30 minutes workout',
      frequency: 'daily',
      color: '#10B981',
      isActive: true,
      currentStreak: 5,
      longestStreak: 12,
      completionRate: 85,
      lastCompleted: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  sendPaginated(
    res,
    habits,
    Number(page),
    Number(limit),
    habits.length,
    'Habits retrieved successfully'
  );
});

export const getHabitById = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement get habit by ID from database
  const { id } = req.params;

  logger.debug('Fetching habit by ID', { habitId: id, userId: req.userId });

  // Mock habit data until implementation
  const habit = {
    id,
    name: 'Morning Exercise',
    description: '30 minutes workout every morning',
    frequency: 'daily',
    color: '#10B981',
    userId: req.userId,
    isActive: true,
    currentStreak: 5,
    longestStreak: 12,
    completionRate: 85,
    totalCompletions: 42,
    lastCompleted: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recentActivity: [{ date: new Date().toISOString(), completed: true }],
  };

  sendSuccess(res, { habit }, 'Habit details retrieved successfully');
});

export const updateHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement update habit in database
  const { id } = req.params;
  const { name, description, frequency, color, isActive } = req.body;

  logger.info('Habit update requested', { habitId: id, userId: req.userId });

  // Mock updated habit until implementation
  const updatedHabit = {
    id,
    name: name || 'Updated Habit',
    description: description || null,
    frequency: frequency || 'daily',
    color: color || '#3B82F6',
    isActive: isActive !== undefined ? isActive : true,
    updatedAt: new Date().toISOString(),
  };

  sendSuccess(res, { habit: updatedHabit }, 'Habit updated successfully');
});

export const deleteHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement delete habit from database
  const { id } = req.params;

  logger.info('Habit deletion requested', { habitId: id, userId: req.userId });

  sendSuccess(res, { deletedId: id }, 'Habit deleted successfully');
});
