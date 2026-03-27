import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { paymentMethodsService } from './payment-methods.service';

class PaymentMethodsController {
  listMine = async (req: Request, res: Response) => {
    const result = await paymentMethodsService.listMine(req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'Payment methods fetched successfully', result);
  };

  create = async (req: Request, res: Response) => {
    const result = await paymentMethodsService.create(req.user!, req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Payment method created successfully', result);
  };

  setDefault = async (req: Request, res: Response) => {
    const result = await paymentMethodsService.setDefault(req.user!, req.params.paymentMethodId);
    return sendSuccess(res, HTTP_STATUS.OK, 'Default payment method updated successfully', result);
  };
}

export const paymentMethodsController = new PaymentMethodsController();