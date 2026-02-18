import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { collectSystemStats } from '../utils/systemStats';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await collectSystemStats();
  sendSuccess(res, stats);
});
