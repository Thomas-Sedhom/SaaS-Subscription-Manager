import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { UpdateUserDto } from './dto/update-user.dto';
import { usersController } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authMiddleware);
usersRouter.get('/profile', asyncHandler(usersController.getProfile));
usersRouter.patch(
  '/profile',
  validateDto(UpdateUserDto),
  asyncHandler(usersController.updateProfile)
);
usersRouter.get('/', authorizeRoles('ADMIN'), asyncHandler(usersController.listUsers));
usersRouter.get('/:userId', authorizeRoles('ADMIN'), asyncHandler(usersController.getUserById));