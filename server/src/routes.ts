import type { Express } from 'express';
import { Router } from 'express';

import { appConfig } from './config/app.config';
import { adminRouter } from './modules/admin/admin.routes';
import { authRouter } from './modules/auth/auth.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { plansRouter } from './modules/plans/plans.routes';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes';
import { usersRouter } from './modules/users/users.routes';

export const registerRoutes = (app: Express): void => {
  const router = Router();

  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/plans', plansRouter);
  router.use('/subscriptions', subscriptionsRouter);
  router.use('/payments', paymentsRouter);
  router.use('/admin', adminRouter);

  app.use(appConfig.apiPrefix, router);
};