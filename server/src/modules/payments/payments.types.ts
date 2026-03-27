export interface PaymentProcessResult<TSubscription> {
  payment: unknown;
  subscription: TSubscription;
}