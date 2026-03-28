import { prisma } from '../../shared/database/prisma';
import {
  mapPaymentMethodRecord,
  mapPaymentRecord,
  mapSubscriptionRecord
} from '../../shared/database/prisma-mappers';

interface CreatePaymentInput {
  subscriptionId: string;
  paymentMethodId: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  failureReason: string | null;
  type: 'SUBSCRIPTION_CREATE' | 'PLAN_CHANGE';
  targetPlanId: string | null;
}

interface UpdatePaymentInput {
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
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
  async findById(id: string) {
    const payment = await prisma.payment.findUnique({
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
    const payments = await prisma.payment.findMany({
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
    const payments = await prisma.payment.findMany({
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
    const payment = await prisma.payment.create({
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
    const existingPayment = await prisma.payment.findUnique({ where: { id } });

    if (!existingPayment) {
      return null;
    }

    await prisma.payment.update({
      where: { id },
      data
    });

    return this.findById(id);
  }
}
