import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { subscriptionsService } from './subscriptions.service';

class SubscriptionsController {
  getMine = async (req: Request, res: Response) => {
    const result = await subscriptionsService.getMySubscriptions(req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'Subscriptions fetched successfully', result);
  };

  selectPlan = async (req: Request, res: Response) => {
    const result = await subscriptionsService.selectPlan(req.user!, req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Plan selected successfully', result);
  };

  create = async (req: Request, res: Response) => {
    const result = await subscriptionsService.createSubscription(req.user!, req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Subscription created successfully', result);
  };

  checkoutPending = async (req: Request, res: Response) => {
    const result = await subscriptionsService.checkoutPendingSubscription(req.user!, req.params.subscriptionId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Subscription checkout completed successfully', result);
  };

  changePlan = async (req: Request, res: Response) => {
    const result = await subscriptionsService.changePlan(req.user!, req.params.subscriptionId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Plan changed successfully', result);
  };

  cancel = async (req: Request, res: Response) => {
    const result = await subscriptionsService.cancelSubscription(req.user!, req.params.subscriptionId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Subscription canceled successfully', result);
  };
}

export const subscriptionsController = new SubscriptionsController();
