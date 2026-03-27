import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { plansController } from './plans.controller';

export const plansRouter = Router();

plansRouter.use(authMiddleware);
plansRouter.get('/', asyncHandler(plansController.listPlans));
plansRouter.get('/:planId', asyncHandler(plansController.getPlanById));
plansRouter.post(
  '/',
  authorizeRoles('ADMIN'),
  validateDto(CreatePlanDto),
  asyncHandler(plansController.createPlan)
);
plansRouter.patch(
  '/:planId',
  authorizeRoles('ADMIN'),
  validateDto(UpdatePlanDto),
  asyncHandler(plansController.updatePlan)
);
plansRouter.delete(
  '/:planId',
  authorizeRoles('ADMIN'),
  asyncHandler(plansController.deletePlan)
);