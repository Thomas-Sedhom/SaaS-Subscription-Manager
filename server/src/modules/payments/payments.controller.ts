import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { paymentsService } from './payments.service';

class PaymentsController {
  listMine = async (req: Request, res: Response) => {
    const result = await paymentsService.listMine(req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'Payments fetched successfully', result);
  };
}

export const paymentsController = new PaymentsController();