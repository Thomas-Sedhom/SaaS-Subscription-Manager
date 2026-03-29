export interface AdminDashboardStats {
  totalUsers: number;
  totalPlans: number;
  totalSubscriptions: number;
  totalPayments: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}
