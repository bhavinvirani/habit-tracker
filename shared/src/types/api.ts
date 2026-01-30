/**
 * Standard API Response Interface
 * All API endpoints return this structure for consistency
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
    stack?: string; // Only in development
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response (deprecated - use ApiResponse with meta.pagination)
 * @deprecated Use ApiResponse<T[]> with meta.pagination instead
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
