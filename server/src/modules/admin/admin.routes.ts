import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { adminController } from './admin.controller';

export const adminRouter = Router();

adminRouter.use(authMiddleware, roleMiddleware('ADMIN'));
adminRouter.get('/dashboard', asyncHandler(adminController.dashboard));