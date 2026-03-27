import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { subscriptionsController } from './subscriptions.controller';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(authMiddleware);
subscriptionsRouter.get('/me', asyncHandler(subscriptionsController.getMine));
subscriptionsRouter.post('/', validateDto(CreateSubscriptionDto), asyncHandler(subscriptionsController.create));
subscriptionsRouter.post(
  '/:subscriptionId/change-plan',
  validateDto(ChangePlanDto),
  asyncHandler(subscriptionsController.changePlan)
);
subscriptionsRouter.post(
  '/:subscriptionId/cancel',
  validateDto(CancelSubscriptionDto),
  asyncHandler(subscriptionsController.cancel)
);