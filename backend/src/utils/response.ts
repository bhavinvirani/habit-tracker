import { Response } from 'express';
import logger from './logger';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Success response helper
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  additionalMeta?: Partial<Omit<ApiResponse['meta'], 'timestamp'>>
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...additionalMeta,
    },
  };

  // Log success response
  logger.debug('Success response sent', {
    statusCode,
    message,
    hasData: !!data,
  });

  return res.status(statusCode).json(response);
};

/**
 * Created response helper (201)
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * No content response helper (204)
 */
export const sendNoContent = (res: Response): Response => {
  logger.debug('No content response sent');
  return res.status(204).send();
};

/**
 * Paginated response helper
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, data, message, 200, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
};

/**
 * Error response helper (handled by error middleware, but useful for manual responses)
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: Record<string, unknown>
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  logger.error('Error response sent', {
    statusCode,
    message,
    code,
    details,
  });

  return res.status(statusCode).json(response);
};
