import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import { NotFoundError } from '../utils/AppError';
import * as authService from '../services/auth.service';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.register(req.body);

  sendCreated(
    res,
    { user: result.user, token: result.token },
    'Account created successfully! Welcome aboard 🎉'
  );
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.login(req.body);

  sendSuccess(
    res,
    { user: result.user, token: result.token },
    'Login successful. Welcome back! 👋'
  );
});

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getUserById(req.userId!);

  if (!user) {
    throw new NotFoundError('User');
  }

  sendSuccess(res, { user }, 'User details retrieved successfully');
});
