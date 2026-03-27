import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { subscriptionsService } from './subscriptions.service';

class SubscriptionsController {
  listMine = async (req: Request, res: Response) => {
    const result = await subscriptionsService.listUserSubscriptions(req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'Subscriptions fetched successfully', result);
  };

  create = async (req: Request, res: Response) => {
    const result = await subscriptionsService.createSubscription(req.user!, req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Subscription created successfully', result);
  };

  update = async (req: Request, res: Response) => {
    const result = await subscriptionsService.updateSubscription(
      req.user!,
      req.params.subscriptionId,
      req.body
    );
    return sendSuccess(res, HTTP_STATUS.OK, 'Subscription updated successfully', result);
  };
}

export const subscriptionsController = new SubscriptionsController();