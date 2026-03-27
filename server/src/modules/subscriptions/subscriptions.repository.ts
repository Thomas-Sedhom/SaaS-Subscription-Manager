import {
  createId,
  paymentStore,
  planStore,
  subscriptionStore,
  userStore
} from '../../shared/database/in-memory-store';
import type { BillingCycle, SubscriptionStatus } from '../../shared/database/in-memory-store';

interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
}

interface UpdateSubscriptionInput {
  planId?: string;
  status?: SubscriptionStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionsRepository {
  private mapSubscription(subscription: (typeof subscriptionStore)[number]) {
    return {
      ...subscription,
      user: userStore.find((user) => user.id === subscription.userId) ?? null,
      plan: planStore.find((plan) => plan.id === subscription.planId) ?? null,
      payments: paymentStore.filter((payment) => payment.subscriptionId === subscription.id)
    };
  }

  findById(id: string) {
    const subscription = subscriptionStore.find((entry) => entry.id === id) ?? null;
    return Promise.resolve(subscription ? this.mapSubscription(subscription) : null);
  }

  findByUserId(userId: string) {
    return Promise.resolve(
      subscriptionStore
        .filter((subscription) => subscription.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((subscription) => this.mapSubscription(subscription))
    );
  }

  findCurrentByUserId(userId: string) {
    const subscription =
      subscriptionStore
        .filter(
          (item) => item.userId === userId && (item.status === 'ACTIVE' || item.status === 'PENDING')
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;

    return Promise.resolve(subscription ? this.mapSubscription(subscription) : null);
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
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
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