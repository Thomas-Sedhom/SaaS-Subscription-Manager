import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { usersController } from './users.controller';

export const usersRouter = Router();

usersRouter.get('/profile', authMiddleware, asyncHandler(usersController.getProfile));
usersRouter.patch(
  '/profile',
  authMiddleware,
  validateDto(UpdateUserDto),
  asyncHandler(usersController.updateProfile)
);
usersRouter.get('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(usersController.listUsers));
usersRouter.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateDto(CreateUserDto),
  asyncHandler(usersController.createUser)
);