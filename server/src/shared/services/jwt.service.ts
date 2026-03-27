import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env';
import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../errors/app-error';
import type { AuthenticatedRequestUser } from '../types/common.types';

class JWTService {
  createJWT(user: AuthenticatedRequestUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN
      } as SignOptions
    );
  }

  verifyToken(token: string): AuthenticatedRequestUser {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthenticatedRequestUser;
    } catch {
      throw new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
    }
  }
}

export const jwtService = new JWTService();