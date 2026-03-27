import type { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { HTTP_STATUS } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../errors/app-error';
import type { AuthenticatedRequestUser } from '../types/common.types';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  const token = header.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedRequestUser;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
  }
};