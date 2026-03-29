export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscriptionResponse {
  id: string;
  planId: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELED';
  startDate: Date | null;
  endDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    features: string[];
    isActive: boolean;
  } | null;
}

export interface UserDetailResponse extends UserResponse {
  subscriptions: UserSubscriptionResponse[];
}
