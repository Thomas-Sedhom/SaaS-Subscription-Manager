import { prisma } from '../../shared/database/prisma';
import { useInMemoryDatabase } from '../../config/env';
import {
  paymentStore,
  planStore,
  subscriptionStore,
  userStore
} from '../../shared/database/in-memory-store';

export class AdminRepository {
  async getDashboardStats() {
    if (useInMemoryDatabase) {
      return {
        totalUsers: userStore.length,
        totalPlans: planStore.length,
        totalSubscriptions: subscriptionStore.length,
        totalPayments: paymentStore.length
      };
    }

    const [totalUsers, totalPlans, totalSubscriptions, totalPayments] = await Promise.all([
      prisma!.user.count(),
      prisma!.plan.count(),
      prisma!.subscription.count(),
      prisma!.payment.count()
    ]);

    return {
      totalUsers,
      totalPlans,
      totalSubscriptions,
      totalPayments
    };
  }
}
