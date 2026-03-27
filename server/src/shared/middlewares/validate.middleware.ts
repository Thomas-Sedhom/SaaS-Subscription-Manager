import type { NextFunction, Request, Response } from 'express';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { HTTP_STATUS } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../errors/app-error';

export const validateDto = <T extends object>(DtoClass: new () => T) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      next(new AppError(MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, errors));
      return;
    }

    req.body = dto;
    next();
  };
};