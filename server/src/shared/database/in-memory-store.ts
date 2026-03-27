export type UserRole = 'USER' | 'ADMIN';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

export const userStore: UserRecord[] = [];
export const planStore: PlanRecord[] = [];
export const subscriptionStore: SubscriptionRecord[] = [];
export const paymentStore: PaymentRecord[] = [];

export const createId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};