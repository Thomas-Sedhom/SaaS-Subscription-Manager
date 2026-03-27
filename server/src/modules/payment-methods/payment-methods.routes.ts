import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { validateDto } from '../../shared/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { paymentMethodsController } from './payment-methods.controller';

export const paymentMethodsRouter = Router();

paymentMethodsRouter.use(authMiddleware);
paymentMethodsRouter.get('/me', asyncHandler(paymentMethodsController.listMine));
paymentMethodsRouter.post(
  '/',
  validateDto(CreatePaymentMethodDto),
  asyncHandler(paymentMethodsController.create)
);
paymentMethodsRouter.patch(
  '/:paymentMethodId/default',
  asyncHandler(paymentMethodsController.setDefault)
);