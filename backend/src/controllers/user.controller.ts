import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import logger from '../utils/logger';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement get user profile from database
  logger.debug('Fetching user profile', { userId: req.userId });

  // Mock profile data until implementation
  const profile = {
    id: req.userId,
    email: 'user@example.com',
    name: 'John Doe',
    bio: 'Habit tracking enthusiast',
    avatar: null,
    timezone: 'UTC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalHabits: 0,
      activeStreaks: 0,
      completionRate: 0,
    },
  };

  sendSuccess(res, { profile }, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement update user profile in database
  const { name, bio, timezone } = req.body;

  logger.info('Updating user profile', { userId: req.userId, fields: Object.keys(req.body) });

  // Mock updated profile until implementation
  const updatedProfile = {
    id: req.userId,
    email: 'user@example.com',
    name: name || 'John Doe',
    bio: bio || 'Habit tracking enthusiast',
    timezone: timezone || 'UTC',
    updatedAt: new Date().toISOString(),
  };

  sendSuccess(res, { profile: updatedProfile }, 'Profile updated successfully');
});
