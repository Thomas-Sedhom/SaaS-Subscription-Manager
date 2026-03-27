import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { plansService } from './plans.service';

class PlansController {
  listPlans = async (_req: Request, res: Response) => {
    const result = await plansService.listPlans();
    return sendSuccess(res, HTTP_STATUS.OK, 'Plans fetched successfully', result);
  };

  createPlan = async (req: Request, res: Response) => {
    const result = await plansService.createPlan(req.body);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Plan created successfully', result);
  };

  updatePlan = async (req: Request, res: Response) => {
    const result = await plansService.updatePlan(req.params.planId, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'Plan updated successfully', result);
  };

  deletePlan = async (req: Request, res: Response) => {
    const result = await plansService.deactivatePlan(req.params.planId);
    return sendSuccess(res, HTTP_STATUS.OK, 'Plan deactivated successfully', result);
  };
}

export const plansController = new PlansController();