import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { authController } from './auth.controller';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';

export const authRouter = Router();

authRouter.post('/register', validateDto(RegisterDto), asyncHandler(authController.register));
authRouter.post('/login', validateDto(LoginDto), asyncHandler(authController.login));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));