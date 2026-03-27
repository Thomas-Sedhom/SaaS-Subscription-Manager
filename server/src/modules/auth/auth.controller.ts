import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { authService } from './auth.service';
import type { LoginDto, RegisterDto } from './dto/create-auth.dto';

class AuthController {
  register = async (req: Request<unknown, unknown, RegisterDto>, res: Response) => {
    const result = await authService.register(req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'User registered successfully', result);
  };

  login = async (req: Request<unknown, unknown, LoginDto>, res: Response) => {
    const result = await authService.login(req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'User logged in successfully', result);
  };

  me = async (req: Request, res: Response) => {
    const result = await authService.getCurrentUser(req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'Authenticated user fetched successfully', result);
  };
}

export const authController = new AuthController();