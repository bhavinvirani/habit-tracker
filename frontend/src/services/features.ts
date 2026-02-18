import api from './api';
import { FeatureFlag } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const featuresApi = {
  getEnabledFeatures: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<{ features: string[] }>>('/features');
    return response.data.data.features;
  },

  // Admin endpoints
  getAllFlags: async (): Promise<FeatureFlag[]> => {
    const response = await api.get<ApiResponse<{ flags: FeatureFlag[] }>>('/admin/features');
    return response.data.data.flags;
  },

  updateFlag: async (
    key: string,
    data: { enabled?: boolean; metadata?: Record<string, unknown> }
  ): Promise<FeatureFlag> => {
    const response = await api.patch<ApiResponse<{ flag: FeatureFlag }>>(
      `/admin/features/${key}`,
      data
    );
    return response.data.data.flag;
  },
};
