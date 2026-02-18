import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response';
import { featureFlagService } from '../services/featureFlag.service';
import { adminService } from '../services/admin.service';
import { collectSystemStats } from '../utils/systemStats';
import {
  UpdateFeatureFlagInput,
  CreateFeatureFlagInput,
  UserListQuery,
  UpdateUserRoleInput,
  AuditLogQuery,
  TrendsQuery,
  ExportParam,
} from '../validators/admin.validator';

// ─── Feature Flags ──────────────────────────────────────────────

export const getAllFeatureFlags = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const flags = await featureFlagService.getAll();
  sendSuccess(res, { flags }, 'Feature flags retrieved successfully');
});

export const updateFeatureFlag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const key = req.params.key as string;
  const data = req.body as UpdateFeatureFlagInput;
  const flag = await featureFlagService.updateFlag(key, data, req.userId!);
  sendSuccess(res, { flag }, `Feature flag '${key}' updated successfully`);
});

export const createFeatureFlag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = req.body as CreateFeatureFlagInput;
  const flag = await featureFlagService.createFlag(data, req.userId!);
  sendCreated(res, { flag }, `Feature flag '${data.key}' created successfully`);
});

export const deleteFeatureFlag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const key = req.params.key as string;
  await featureFlagService.deleteFlag(key, req.userId!);
  sendNoContent(res);
});

export const getFeatureFlagAuditLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { flagKey, page, limit } = req.query as unknown as AuditLogQuery;
  const { entries, total } = await featureFlagService.getAuditLog({ flagKey, page, limit });
  sendPaginated(res, entries as unknown[], page, limit, total, 'Audit log retrieved successfully');
});

// ─── Users ──────────────────────────────────────────────────────

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, search, sortBy, sortOrder } = req.query as unknown as UserListQuery;
  const { users, total } = await adminService.getAllUsers({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });
  sendPaginated(res, users as unknown[], page, limit, total, 'Users retrieved successfully');
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id as string;
  const { isAdmin } = req.body as UpdateUserRoleInput;
  const user = await adminService.updateUserRole(userId, isAdmin, req.userId!);
  sendSuccess(res, { user }, `User role updated successfully`);
});

// ─── Application Stats ─────────────────────────────────────────

export const getApplicationStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await adminService.getApplicationStats();
  sendSuccess(res, { stats }, 'Application stats retrieved successfully');
});

// ─── System Stats ───────────────────────────────────────────────

export const getSystemStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await collectSystemStats();
  sendSuccess(res, { stats }, 'System stats retrieved successfully');
});

// ─── Trends ─────────────────────────────────────────────────────

export const getTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { days } = req.query as unknown as TrendsQuery;
  const trends = await adminService.getTrends(days);
  sendSuccess(res, { trends }, 'Trends retrieved successfully');
});

// ─── Content Breakdown ──────────────────────────────────────────

export const getContentBreakdown = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const breakdown = await adminService.getContentBreakdown();
  sendSuccess(res, { breakdown }, 'Content breakdown retrieved successfully');
});

// ─── User Detail ────────────────────────────────────────────────

export const getUserDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id as string;
  const detail = await adminService.getUserDetail(userId);
  sendSuccess(res, { user: detail }, 'User detail retrieved successfully');
});

// ─── Data Export ────────────────────────────────────────────────

export const exportData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type } = req.params as unknown as ExportParam;
  const { headers, rows } = await adminService.exportData(type);

  const escapeCsv = (val: unknown): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ];
  const csv = csvLines.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.csv"`);
  res.send(csv);
});

// ─── Session Management ─────────────────────────────────────────

export const getActiveSessions = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const sessions = await adminService.getActiveSessions();
  sendSuccess(res, { sessions }, 'Active sessions retrieved successfully');
});

export const revokeSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessionId = req.params.id as string;
  await adminService.revokeSession(sessionId);
  sendSuccess(res, null, 'Session revoked successfully');
});

export const revokeAllUserSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId as string;
  const count = await adminService.revokeAllUserSessions(userId);
  sendSuccess(res, { revokedCount: count }, `Revoked ${count} sessions`);
});

// ─── Enabled Features (public, authenticated) ──────────────────

export const getEnabledFeatures = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const keys = await featureFlagService.getEnabledKeys();
  sendSuccess(res, { features: keys }, 'Enabled features retrieved successfully');
});
