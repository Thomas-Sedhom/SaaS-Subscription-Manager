import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { paymentsService } from './payments.service';

class PaymentsController {
  listBySubscription = async (req: Request, res: Response) => {
    const result = await paymentsService.listBySubscription(req.user!, req.params.subscriptionId);
    return sendSuccess(res, HTTP_STATUS.OK, 'Payments fetched successfully', result);
  };

  create = async (req: Request, res: Response) => {
    const result = await paymentsService.createPayment(req.user!, req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Payment processed successfully', result);
  };

  update = async (req: Request, res: Response) => {
    const result = await paymentsService.updatePayment(req.params.paymentId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Payment updated successfully', result);
  };
}

export const paymentsController = new PaymentsController();