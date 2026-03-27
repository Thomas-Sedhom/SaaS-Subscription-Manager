export interface PaymentMethodResponse {
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