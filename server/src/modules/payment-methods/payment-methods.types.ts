export interface PaymentMethodResponse {
  id: string;
  userId: string;
  methodType: string;
  isDefault: boolean;
  last4: string | null;
  cardholderName: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResolvedCheckoutPaymentMethod {
  id: string | null;
  userId: string;
  methodType: string;
  isDefault: boolean;
  last4: string | null;
  cardholderName: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
