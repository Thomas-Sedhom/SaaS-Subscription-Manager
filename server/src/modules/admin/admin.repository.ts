import {
  paymentStore,
  planStore,
  subscriptionStore,
  userStore
} from '../../shared/database/in-memory-store';

export class AdminRepository {
  async getDashboardStats() {
    return {
      totalUsers: userStore.length,
      totalPlans: planStore.length,
      totalSubscriptions: subscriptionStore.length,
      totalPayments: paymentStore.length
    };
  }
}