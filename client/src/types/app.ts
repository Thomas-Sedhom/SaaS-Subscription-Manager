export type UserRole = 'USER' | 'ADMIN';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentType = 'SUBSCRIPTION_CREATE' | 'PLAN_CHANGE';

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  token: string;
  user: AuthUser;
}

export interface AuthMeResponse {
  statusCode: number;
  message: string;
  user: AuthUser;
}

export interface LogoutResponse {
  statusCode: number;
  message: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  plan?: Plan | null;
}

export interface SubscriptionSummary {
  currentSubscription: Subscription | null;
  history: Subscription[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  methodType: string;
  methodDetails: string;
  isDefault: boolean;
  last4?: string | null;
  brand?: string | null;
  isActive: boolean;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  paymentMethodId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  type?: PaymentType;
  brand?: string | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPlans: number;
  totalSubscriptions: number;
  totalPayments: number;
}
