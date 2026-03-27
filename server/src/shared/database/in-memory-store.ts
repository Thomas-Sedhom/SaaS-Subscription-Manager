export type UserRole = 'USER' | 'ADMIN';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentType = 'SUBSCRIPTION_CREATE' | 'PLAN_CHANGE';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanRecord {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  subscriptionId: string;
  paymentMethodId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  failureReason: string | null;
  type: PaymentType;
  targetPlanId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodRecord {
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
}

export const userStore: UserRecord[] = [];
export const planStore: PlanRecord[] = [];
export const subscriptionStore: SubscriptionRecord[] = [];
export const paymentStore: PaymentRecord[] = [];
export const paymentMethodStore: PaymentMethodRecord[] = [];

export const createId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

export const resetInMemoryStore = (): void => {
  userStore.length = 0;
  planStore.length = 0;
  subscriptionStore.length = 0;
  paymentStore.length = 0;
  paymentMethodStore.length = 0;
};