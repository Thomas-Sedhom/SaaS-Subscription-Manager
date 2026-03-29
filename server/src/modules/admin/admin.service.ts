import { usersService } from '../users/users.service';
import { AdminRepository } from './admin.repository';
import type { CreateAdminPayload } from './admin.types';

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  getDashboardStats() {
    return this.adminRepository.getDashboardStats();
  }

  createAdmin(payload: CreateAdminPayload) {
    return usersService.createUser({
      ...payload,
      role: 'ADMIN'
    });
  }
}

export const adminService = new AdminService(new AdminRepository());
