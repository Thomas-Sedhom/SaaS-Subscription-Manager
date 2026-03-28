import { prisma } from '../../shared/database/prisma';

export class AdminRepository {
  async getDashboardStats() {
    const [totalUsers, totalPlans, totalSubscriptions, totalPayments] = await Promise.all([
      prisma.user.count(),
      prisma.plan.count(),
      prisma.subscription.count(),
      prisma.payment.count()
    ]);

    return {
      totalUsers,
      totalPlans,
      totalSubscriptions,
      totalPayments
    };
  }
}
