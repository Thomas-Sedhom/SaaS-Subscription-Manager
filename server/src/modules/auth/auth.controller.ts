import type { CookieOptions, Request, Response } from 'express';

import { env } from '../../config/env';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { authService } from './auth.service';

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

class AuthController {
  signup = async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);

    res.cookie('accessToken', result.token, authCookieOptions);

    return res.status(HTTP_STATUS.CREATED).json({
      statusCode: HTTP_STATUS.CREATED,
      token: result.token,
      message: 'User signed up successfully',
      user: result.user
    });
  };

  login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.cookie('accessToken', result.token, authCookieOptions);

    return res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      token: result.token,
      message: 'User logged in successfully',
      user: result.user
    });
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      message: 'User logged out successfully'
    });
  };

  me = async (req: Request, res: Response) => {
    const result = await authService.getCurrentUser(req.user!);

    return res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      message: 'Authenticated user fetched successfully',
      user: result
    });
  };
}

export const authController = new AuthController();