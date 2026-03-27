import {
  createId,
  paymentStore,
  planStore,
  subscriptionStore
} from '../../shared/database/in-memory-store';
import type { PaymentStatus } from '../../shared/database/in-memory-store';

interface CreatePaymentInput {
  subscriptionId: string;
  amount: number;
  paymentMethod: string;
  provider: string;
  status: PaymentStatus;
}

interface UpdatePaymentInput {
  status?: PaymentStatus;
}

export class PaymentsRepository {
  findById(id: string) {
    const payment = paymentStore.find((entry) => entry.id === id) ?? null;

    if (!payment) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      ...payment,
      subscription: subscriptionStore.find((subscription) => subscription.id === payment.subscriptionId) ?? null
    });
  }

  findBySubscriptionId(subscriptionId: string) {
    return Promise.resolve(
      paymentStore
        .filter((payment) => payment.subscriptionId === subscriptionId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  findSubscriptionById(subscriptionId: string) {
    const subscription = subscriptionStore.find((entry) => entry.id === subscriptionId) ?? null;

    if (!subscription) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      ...subscription,
      plan: planStore.find((plan) => plan.id === subscription.planId) ?? null
    });
  }

  create(data: CreatePaymentInput) {
    const now = new Date();
    const payment = {
      id: createId('payment'),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    paymentStore.push(payment);

    return this.findById(payment.id);
  }

  update(id: string, data: UpdatePaymentInput) {
    const payment = paymentStore.find((entry) => entry.id === id);

    if (!payment) {
      return Promise.resolve(null);
    }

    Object.assign(payment, data, {
      updatedAt: new Date()
    });

    return this.findById(id);
  }

  updateSubscriptionToActive(subscriptionId: string) {
    const subscription = subscriptionStore.find((entry) => entry.id === subscriptionId) ?? null;

    if (!subscription) {
      return Promise.resolve(null);
    }

    Object.assign(subscription, {
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: null,
      updatedAt: new Date()
    });

    return Promise.resolve(subscription);
  }
}