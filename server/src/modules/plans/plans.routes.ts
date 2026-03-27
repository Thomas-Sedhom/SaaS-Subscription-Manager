import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { plansController } from './plans.controller';

export const plansRouter = Router();

plansRouter.get('/', asyncHandler(plansController.listPlans));
plansRouter.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateDto(CreatePlanDto),
  asyncHandler(plansController.createPlan)
);
plansRouter.patch(
  '/:planId',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateDto(UpdatePlanDto),
  asyncHandler(plansController.updatePlan)
);
plansRouter.delete(
  '/:planId',
  authMiddleware,
  roleMiddleware('ADMIN'),
  asyncHandler(plansController.deletePlan)
);