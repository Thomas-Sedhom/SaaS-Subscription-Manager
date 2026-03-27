export interface UserSubscriptionOverview<TSubscription> {
  currentSubscription: TSubscription | null;
  history: TSubscription[];
}