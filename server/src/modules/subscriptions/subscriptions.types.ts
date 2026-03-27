export interface SubscriptionFilters {
  userId?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
}