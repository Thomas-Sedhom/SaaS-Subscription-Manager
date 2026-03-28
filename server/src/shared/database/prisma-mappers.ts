import { Prisma } from '@prisma/client';

const toNumber = (value: Prisma.Decimal | number) => {
  return typeof value === 'number' ? value : value.toNumber();
};

const normalizeFeatures = (features: string[]) => {
  return [...new Set(features.map((feature) => feature.trim()).filter(Boolean))];
};

export const createPlanFeatureCreateInput = (features: string[]) => {
  return normalizeFeatures(features).map((content) => ({
    feature: {
      connectOrCreate: {
        where: { content },
        create: { content }
      }
    }
  }));
};

export const mapUserRecord = <T extends { id: string; name: string; email: string; passwordHash: string; role: 'USER' | 'ADMIN'; createdAt: Date; updatedAt: Date }>(user: T) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  passwordHash: user.passwordHash,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const mapPaymentMethodRecord = <T extends { id: string; userId: string; methodType: string; methodDetails: string; isDefault: boolean; last4: string | null; brand: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }>(paymentMethod: T) => ({
  id: paymentMethod.id,
  userId: paymentMethod.userId,
  methodType: paymentMethod.methodType,
  methodDetails: paymentMethod.methodDetails,
  isDefault: paymentMethod.isDefault,
  last4: paymentMethod.last4,
  brand: paymentMethod.brand,
  isActive: paymentMethod.isActive,
  createdAt: paymentMethod.createdAt,
  updatedAt: paymentMethod.updatedAt
});

export const mapPlanRecord = <T extends {
  id: string;
  name: string;
  price: Prisma.Decimal | number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  planFeatures?: Array<{ feature: { content: string } }>;
}>(plan: T) => ({
  id: plan.id,
  name: plan.name,
  price: toNumber(plan.price),
  billingCycle: plan.billingCycle,
  features: plan.planFeatures?.map((planFeature) => planFeature.feature.content) ?? [],
  isActive: plan.isActive,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt
});

export const mapPaymentRecord = <T extends {
  id: string;
  subscriptionId: string;
  paymentMethodId: string | null;
  amount: Prisma.Decimal | number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  provider: string;
  failureReason: string | null;
  type: 'SUBSCRIPTION_CREATE' | 'PLAN_CHANGE';
  targetPlanId: string | null;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: {
    id: string;
    userId: string;
    methodType: string;
    methodDetails: string;
    isDefault: boolean;
    last4: string | null;
    brand: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  subscription?: unknown;
  targetPlan?: unknown;
}>(payment: T) => ({
  id: payment.id,
  subscriptionId: payment.subscriptionId,
  paymentMethodId: payment.paymentMethodId,
  amount: toNumber(payment.amount),
  currency: payment.currency,
  status: payment.status,
  provider: payment.provider,
  failureReason: payment.failureReason,
  type: payment.type,
  targetPlanId: payment.targetPlanId,
  brand: payment.paymentMethod?.brand ?? null,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
  paymentMethod: payment.paymentMethod ? mapPaymentMethodRecord(payment.paymentMethod) : null,
  subscription: payment.subscription ?? null,
  targetPlan: payment.targetPlan ?? null
});

export const mapSubscriptionRecord = <T extends {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
  startDate: Date | null;
  endDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
  } | null;
  plan?: {
    id: string;
    name: string;
    price: Prisma.Decimal | number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    planFeatures?: Array<{ feature: { content: string } }>;
  } | null;
  payments?: Array<{
    id: string;
    subscriptionId: string;
    paymentMethodId: string | null;
    amount: Prisma.Decimal | number;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    provider: string;
    failureReason: string | null;
    type: 'SUBSCRIPTION_CREATE' | 'PLAN_CHANGE';
    targetPlanId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}>(subscription: T) => ({
  id: subscription.id,
  userId: subscription.userId,
  planId: subscription.planId,
  status: subscription.status,
  startDate: subscription.startDate,
  endDate: subscription.endDate,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  createdAt: subscription.createdAt,
  updatedAt: subscription.updatedAt,
  user: subscription.user ? mapUserRecord(subscription.user) : null,
  plan: subscription.plan ? mapPlanRecord(subscription.plan) : null,
  payments: subscription.payments?.map((payment) => mapPaymentRecord(payment)) ?? []
});
