import type { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';
import { sendError } from '../utils/api-response';
import { AppError } from './app-error';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, error.errors);
  }

  return sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'Something went wrong on the server',
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
};