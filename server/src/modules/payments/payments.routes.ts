import { Router } from 'express';

import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { paymentsController } from './payments.controller';

export const paymentsRouter = Router();

paymentsRouter.use(authMiddleware);
paymentsRouter.get('/me', asyncHandler(paymentsController.listMine));