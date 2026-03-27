import { createId, paymentMethodStore } from '../../shared/database/in-memory-store';
import type { PaymentMethodRecord } from '../../shared/database/in-memory-store';

interface CreatePaymentMethodInput {
  userId: string;
  methodType: string;
  methodDetails: string;
  isDefault: boolean;
  last4: string | null;
  brand: string | null;
  isActive: boolean;
}

interface UpdatePaymentMethodInput {
  isDefault?: boolean;
  isActive?: boolean;
}

export class PaymentMethodsRepository {
  findByUserId(userId: string) {
    return Promise.resolve(
      paymentMethodStore
        .filter((method) => method.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  findById(paymentMethodId: string) {
    return Promise.resolve(paymentMethodStore.find((method) => method.id === paymentMethodId) ?? null);
  }

  findDefaultByUserId(userId: string) {
    return Promise.resolve(
      paymentMethodStore.find((method) => method.userId === userId && method.isDefault && method.isActive) ?? null
    );
  }

  async clearDefaultForUser(userId: string) {
    paymentMethodStore.forEach((method) => {
      if (method.userId === userId && method.isDefault) {
        method.isDefault = false;
        method.updatedAt = new Date();
      }
    });
  }

  create(data: CreatePaymentMethodInput) {
    const now = new Date();
    const paymentMethod: PaymentMethodRecord = {
      id: createId('payment_method'),
      userId: data.userId,
      methodType: data.methodType,
      methodDetails: data.methodDetails,
      isDefault: data.isDefault,
      last4: data.last4,
      brand: data.brand,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now
    };

    paymentMethodStore.push(paymentMethod);
    return Promise.resolve(paymentMethod);
  }

  update(paymentMethodId: string, data: UpdatePaymentMethodInput) {
    const paymentMethod = paymentMethodStore.find((method) => method.id === paymentMethodId);

    if (!paymentMethod) {
      return Promise.resolve(null);
    }

    Object.assign(paymentMethod, data, {
      updatedAt: new Date()
    });

    return Promise.resolve(paymentMethod);
  }
}