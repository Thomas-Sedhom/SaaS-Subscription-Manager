import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { paymentsController } from './payments.controller';

export const paymentsRouter = Router();

paymentsRouter.use(authMiddleware);
paymentsRouter.get('/subscription/:subscriptionId', asyncHandler(paymentsController.listBySubscription));
paymentsRouter.post('/', validateDto(CreatePaymentDto), asyncHandler(paymentsController.create));
paymentsRouter.patch(
  '/:paymentId',
  roleMiddleware('ADMIN'),
  validateDto(UpdatePaymentDto),
  asyncHandler(paymentsController.update)
);