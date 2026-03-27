import type { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../errors/app-error';

export const roleMiddleware = (...roles: Array<'USER' | 'ADMIN'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
      return;
    }

    next();
  };
};