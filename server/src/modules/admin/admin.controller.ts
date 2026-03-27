import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import { adminService } from './admin.service';

class AdminController {
  dashboard = async (_req: Request, res: Response) => {
    const result = await adminService.getDashboardStats();
    return sendSuccess(res, HTTP_STATUS.OK, 'Dashboard stats fetched successfully', result);
  };
}

export const adminController = new AdminController();