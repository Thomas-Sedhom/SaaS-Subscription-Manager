import { AdminRepository } from './admin.repository';

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  getDashboardStats() {
    return this.adminRepository.getDashboardStats();
  }
}

export const adminService = new AdminService(new AdminRepository());