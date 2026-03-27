import {
  createId,
  paymentStore,
  planStore,
  subscriptionStore
} from '../../shared/database/in-memory-store';

interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
}

interface UpdateSubscriptionInput {
  planId?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
  endDate?: Date | null;
}

export class SubscriptionsRepository {
  findById(id: string) {
    const subscription = subscriptionStore.find((entry) => entry.id === id) ?? null;

    if (!subscription) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      ...subscription,
      plan: planStore.find((plan) => plan.id === subscription.planId) ?? null,
      payments: paymentStore.filter((payment) => payment.subscriptionId === subscription.id)
    });
  }

  findByUserId(userId: string) {
    const items = subscriptionStore
      .filter((subscription) => subscription.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((subscription) => ({
        ...subscription,
        plan: planStore.find((plan) => plan.id === subscription.planId) ?? null,
        payments: paymentStore.filter((payment) => payment.subscriptionId === subscription.id)
      }));

    return Promise.resolve(items);
  }

  findCurrentByUserId(userId: string) {
    const subscription =
      subscriptionStore
        .filter(
          (item) => item.userId === userId && (item.status === 'ACTIVE' || item.status === 'PENDING')
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;

    return Promise.resolve(subscription);
  }

  findPlanById(planId: string) {
    return Promise.resolve(planStore.find((plan) => plan.id === planId) ?? null);
  }

  create(data: CreateSubscriptionInput) {
    const now = new Date();
    const subscription = {
      id: createId('subscription'),
      userId: data.userId,
      planId: data.planId,
      status: data.status,
      startDate: null,
      endDate: null,
      createdAt: now,
      updatedAt: now
    };

    subscriptionStore.push(subscription);

    return this.findById(subscription.id);
  }

  update(id: string, data: UpdateSubscriptionInput) {
    const subscription = subscriptionStore.find((entry) => entry.id === id);

    if (!subscription) {
      return Promise.resolve(null);
    }

    Object.assign(subscription, data, {
      updatedAt: new Date()
    });

    return this.findById(id);
  }
}