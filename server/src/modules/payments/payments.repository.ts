import {
  createId,
  paymentMethodStore,
  paymentStore,
  planStore,
  subscriptionStore
} from '../../shared/database/in-memory-store';
import type { PaymentRecord, PaymentStatus, PaymentType } from '../../shared/database/in-memory-store';

interface CreatePaymentInput {
  subscriptionId: string;
  paymentMethodId: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  failureReason: string | null;
  type: PaymentType;
  targetPlanId: string | null;
}

interface UpdatePaymentInput {
  status?: PaymentStatus;
  failureReason?: string | null;
}

export class PaymentsRepository {
  private mapPayment(payment: PaymentRecord) {
    return {
      ...payment,
      subscription: subscriptionStore.find((subscription) => subscription.id === payment.subscriptionId) ?? null,
      paymentMethod:
        paymentMethodStore.find((paymentMethod) => paymentMethod.id === payment.paymentMethodId) ?? null,
      targetPlan: planStore.find((plan) => plan.id === payment.targetPlanId) ?? null
    };
  }

  findById(id: string) {
    const payment = paymentStore.find((entry) => entry.id === id) ?? null;
    return Promise.resolve(payment ? this.mapPayment(payment) : null);
  }

  findBySubscriptionId(subscriptionId: string) {
    return Promise.resolve(
      paymentStore
        .filter((payment) => payment.subscriptionId === subscriptionId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((payment) => this.mapPayment(payment))
    );
  }

  findByUserId(userId: string) {
    const subscriptionIds = subscriptionStore
      .filter((subscription) => subscription.userId === userId)
      .map((subscription) => subscription.id);

    return Promise.resolve(
      paymentStore
        .filter((payment) => subscriptionIds.includes(payment.subscriptionId))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((payment) => this.mapPayment(payment))
    );
  }

  create(data: CreatePaymentInput) {
    const now = new Date();
    const payment: PaymentRecord = {
      id: createId('payment'),
      subscriptionId: data.subscriptionId,
      paymentMethodId: data.paymentMethodId,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider,
      status: data.status,
      failureReason: data.failureReason,
      type: data.type,
      targetPlanId: data.targetPlanId,
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
}