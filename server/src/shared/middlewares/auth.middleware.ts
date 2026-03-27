import type { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../errors/app-error';
import { jwtService } from '../services/jwt.service';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  const token = header.replace('Bearer ', '');

  try {
    const user = jwtService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};