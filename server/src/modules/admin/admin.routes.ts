import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { adminController } from './admin.controller';
import { CreateAdminDto } from './dto/create-admin.dto';

export const adminRouter = Router();

adminRouter.use(authMiddleware, authorizeRoles('ADMIN'));
adminRouter.get('/dashboard', asyncHandler(adminController.dashboard));
adminRouter.post('/admins', validateDto(CreateAdminDto), asyncHandler(adminController.createAdmin));
