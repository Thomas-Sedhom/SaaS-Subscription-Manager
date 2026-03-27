import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { sendSuccess } from '../../shared/utils/api-response';
import type { UpdateUserDto } from './dto/update-user.dto';
import { usersService } from './users.service';

class UsersController {
  listUsers = async (_req: Request, res: Response) => {
    const result = await usersService.listUsers();
    return sendSuccess(res, HTTP_STATUS.OK, 'Users fetched successfully', result);
  };

  getUserById = async (req: Request, res: Response) => {
    const result = await usersService.getUserById(req.params.userId);
    return sendSuccess(res, HTTP_STATUS.OK, 'User fetched successfully', result);
  };

  getProfile = async (req: Request, res: Response) => {
    const result = await usersService.getProfile(req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'User profile fetched successfully', result);
  };

  updateProfile = async (req: Request<unknown, unknown, UpdateUserDto>, res: Response) => {
    const result = await usersService.updateProfile(req.user!, req.body);
    return sendSuccess(res, HTTP_STATUS.OK, 'User profile updated successfully', result);
  };
}

export const usersController = new UsersController();