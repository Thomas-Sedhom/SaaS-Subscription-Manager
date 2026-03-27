import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { subscriptionsController } from './subscriptions.controller';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(authMiddleware);
subscriptionsRouter.get('/my-subscriptions', asyncHandler(subscriptionsController.listMine));
subscriptionsRouter.post('/', validateDto(CreateSubscriptionDto), asyncHandler(subscriptionsController.create));
subscriptionsRouter.patch(
  '/:subscriptionId',
  validateDto(UpdateSubscriptionDto),
  asyncHandler(subscriptionsController.update)
);