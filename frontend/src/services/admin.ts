import api from './api';
import {
  AdminUser,
  ApplicationStats,
  AuditEntry,
  SystemStats,
  TrendPoint,
  ContentBreakdown,
  AdminUserDetail,
  AdminSession,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const adminApi = {
  getStats: async (): Promise<ApplicationStats> => {
    const response = await api.get<ApiResponse<{ stats: ApplicationStats }>>('/admin/stats');
    return response.data.data.stats;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ users: AdminUser[]; total: number; totalPages: number }> => {
    const response = await api.get<ApiResponse<AdminUser[]>>('/admin/users', { params });
    return {
      users: response.data.data,
      total: response.data.meta?.pagination?.total ?? 0,
      totalPages: response.data.meta?.pagination?.totalPages ?? 1,
    };
  },

  updateUserRole: async (
    userId: string,
    isAdmin: boolean
  ): Promise<{ id: string; name: string; email: string; isAdmin: boolean }> => {
    const response = await api.patch<
      ApiResponse<{ user: { id: string; name: string; email: string; isAdmin: boolean } }>
    >(`/admin/users/${userId}/role`, { isAdmin });
    return response.data.data.user;
  },

  getAuditLog: async (params?: {
    flagKey?: string;
    page?: number;
    limit?: number;
  }): Promise<{ entries: AuditEntry[]; total: number; totalPages: number }> => {
    const response = await api.get<ApiResponse<AuditEntry[]>>('/admin/features/audit', { params });
    return {
      entries: response.data.data,
      total: response.data.meta?.pagination?.total ?? 0,
      totalPages: response.data.meta?.pagination?.totalPages ?? 1,
    };
  },

  // ─── New Endpoints ──────────────────────────────────────────────

  getSystemStats: async (): Promise<SystemStats> => {
    const response = await api.get<ApiResponse<{ stats: SystemStats }>>('/admin/stats/system');
    return response.data.data.stats;
  },

  getTrends: async (days?: number): Promise<TrendPoint[]> => {
    const response = await api.get<ApiResponse<{ trends: TrendPoint[] }>>('/admin/stats/trends', {
      params: days ? { days } : undefined,
    });
    return response.data.data.trends;
  },

  getContentBreakdown: async (): Promise<ContentBreakdown> => {
    const response =
      await api.get<ApiResponse<{ breakdown: ContentBreakdown }>>('/admin/stats/content');
    return response.data.data.breakdown;
  },

  getUserDetail: async (userId: string): Promise<AdminUserDetail> => {
    const response = await api.get<ApiResponse<{ user: AdminUserDetail }>>(
      `/admin/users/${userId}`
    );
    return response.data.data.user;
  },

  exportData: async (type: 'users' | 'habits' | 'logs'): Promise<void> => {
    const response = await api.get(`/admin/export/${type}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  getActiveSessions: async (): Promise<AdminSession[]> => {
    const response = await api.get<ApiResponse<{ sessions: AdminSession[] }>>('/admin/sessions');
    return response.data.data.sessions;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/admin/sessions/${sessionId}`);
  },

  revokeAllUserSessions: async (userId: string): Promise<number> => {
    const response = await api.delete<ApiResponse<{ revokedCount: number }>>(
      `/admin/sessions/user/${userId}`
    );
    return response.data.data.revokedCount;
  },
};
