import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import logger from '../utils/logger';

export const logHabitCompletion = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement log habit completion in database
  const { habitId, completedAt, notes } = req.body;

  logger.info('Logging habit completion', { userId: req.userId, habitId });

  // Mock tracking entry until implementation
  const trackingEntry = {
    id: 'temp-tracking-id',
    habitId,
    userId: req.userId,
    completedAt: completedAt || new Date().toISOString(),
    notes: notes || null,
    createdAt: new Date().toISOString(),
  };

  sendCreated(
    res,
    { entry: trackingEntry },
    'Habit completion logged successfully. Keep up the great work!'
  );
});

export const getTrackingHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement get tracking history from database with pagination
  const { page = 1, limit = 20, habitId } = req.query;

  logger.debug('Fetching tracking history', {
    userId: req.userId,
    habitId,
    page,
    limit,
  });

  // Mock tracking history until implementation
  const history = [
    {
      id: 'entry-1',
      habitId: habitId || 'habit-1',
      completedAt: new Date().toISOString(),
      notes: 'Felt great today!',
      createdAt: new Date().toISOString(),
    },
  ];

  sendPaginated(
    res,
    history,
    Number(page),
    Number(limit),
    1,
    'Tracking history retrieved successfully'
  );
});

export const deleteTrackingEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement delete tracking entry from database
  const { id } = req.params;

  logger.info('Deleting tracking entry', { userId: req.userId, entryId: id });

  sendSuccess(res, { deletedId: id }, 'Tracking entry deleted successfully');
});
