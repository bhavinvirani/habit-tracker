import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import logger from '../utils/logger';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement user registration with Prisma
  const { email, password, name } = req.body;

  logger.info('User registration initiated', { email });

  // Mock user data until implementation
  const user = {
    id: 'temp-id',
    email,
    name,
    createdAt: new Date().toISOString(),
  };

  sendCreated(res, { user }, 'User registered successfully. Please login to continue.');
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement user login with JWT
  const { email, password } = req.body;

  logger.info('User login attempt', { email });

  // Mock response until implementation
  const user = {
    id: 'temp-id',
    email,
    name: 'Test User',
  };

  const token = 'temp-jwt-token';

  sendSuccess(res, { user, token }, 'Login successful. Welcome back!');
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Implement get current user from database
  logger.debug('Fetching current user', { userId: req.userId });

  // Mock user data until implementation
  const user = {
    id: req.userId,
    email: 'user@example.com',
    name: 'Current User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sendSuccess(res, { user }, 'User details retrieved successfully');
});
