import { prisma } from '../../shared/database/prisma';
import { mapPaymentMethodRecord, mapPaymentRecord, mapSubscriptionRecord } from '../../shared/database/prisma-mappers';
import { useInMemoryDatabase } from '../../config/env';
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

const paymentInclude = {
  paymentMethod: true,
  subscription: {
    include: {
      user: true,
      plan: {
        include: {
          planFeatures: {
            include: {
              feature: true
            }
          }
        }
      }
    }
  }
} as const;

export class PaymentsRepository {
  private mapInMemoryPayment(payment: PaymentRecord) {
    return {
      ...payment,
      subscription: subscriptionStore.find((subscription) => subscription.id === payment.subscriptionId) ?? null,
      paymentMethod:
        paymentMethodStore.find((paymentMethod) => paymentMethod.id === payment.paymentMethodId) ?? null,
      targetPlan: planStore.find((plan) => plan.id === payment.targetPlanId) ?? null,
      brand:
        paymentMethodStore.find((paymentMethod) => paymentMethod.id === payment.paymentMethodId)?.brand ?? null
    };
  }

  async findById(id: string) {
    if (useInMemoryDatabase) {
      const payment = paymentStore.find((entry) => entry.id === id) ?? null;
      return payment ? this.mapInMemoryPayment(payment) : null;
    }

    const payment = await prisma!.payment.findUnique({
      where: { id },
      include: paymentInclude
    });

    if (!payment) {
      return null;
    }

    return {
      ...mapPaymentRecord(payment),
      subscription: payment.subscription ? mapSubscriptionRecord({ ...payment.subscription, payments: [] }) : null,
      paymentMethod: payment.paymentMethod ? mapPaymentMethodRecord(payment.paymentMethod) : null,
      targetPlan: null
    };
  }

  async findBySubscriptionId(subscriptionId: string) {
    if (useInMemoryDatabase) {
      return paymentStore
        .filter((payment) => payment.subscriptionId === subscriptionId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((payment) => this.mapInMemoryPayment(payment));
    }

    const payments = await prisma!.payment.findMany({
      where: { subscriptionId },
      include: paymentInclude,
      orderBy: { createdAt: 'desc' }
    });

    return payments.map((payment) => ({
      ...mapPaymentRecord(payment),
      subscription: payment.subscription ? mapSubscriptionRecord({ ...payment.subscription, payments: [] }) : null,
      paymentMethod: payment.paymentMethod ? mapPaymentMethodRecord(payment.paymentMethod) : null,
      targetPlan: null
    }));
  }

  async findByUserId(userId: string) {
    if (useInMemoryDatabase) {
      const subscriptionIds = subscriptionStore
        .filter((subscription) => subscription.userId === userId)
        .map((subscription) => subscription.id);

      return paymentStore
        .filter((payment) => subscriptionIds.includes(payment.subscriptionId))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((payment) => this.mapInMemoryPayment(payment));
    }

    const payments = await prisma!.payment.findMany({
      where: {
        subscription: {
          userId
        }
      },
      include: paymentInclude,
      orderBy: { createdAt: 'desc' }
    });

    return payments.map((payment) => ({
      ...mapPaymentRecord(payment),
      subscription: payment.subscription ? mapSubscriptionRecord({ ...payment.subscription, payments: [] }) : null,
      paymentMethod: payment.paymentMethod ? mapPaymentMethodRecord(payment.paymentMethod) : null,
      targetPlan: null
    }));
  }

  async create(data: CreatePaymentInput) {
    if (useInMemoryDatabase) {
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

    const payment = await prisma!.payment.create({
      data: {
        subscriptionId: data.subscriptionId,
        paymentMethodId: data.paymentMethodId,
        amount: data.amount,
        currency: data.currency,
        provider: data.provider,
        status: data.status,
        failureReason: data.failureReason,
        type: data.type,
        targetPlanId: data.targetPlanId
      }
    });

    return this.findById(payment.id);
  }

  async update(id: string, data: UpdatePaymentInput) {
    if (useInMemoryDatabase) {
      const payment = paymentStore.find((entry) => entry.id === id);

      if (!payment) {
        return null;
      }

      Object.assign(payment, data, {
        updatedAt: new Date()
      });

      return this.findById(id);
    }

    const existingPayment = await prisma!.payment.findUnique({ where: { id } });

    if (!existingPayment) {
      return null;
    }

    await prisma!.payment.update({
      where: { id },
      data
    });

    return this.findById(id);
  }
}
