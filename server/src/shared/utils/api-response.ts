import type { Response } from 'express';

import type { ApiErrorResponse, ApiSuccessResponse } from '../types/common.types';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};