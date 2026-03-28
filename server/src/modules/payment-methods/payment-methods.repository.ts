import { prisma } from '../../shared/database/prisma';
import { mapPaymentMethodRecord } from '../../shared/database/prisma-mappers';

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
  async findByUserId(userId: string) {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return paymentMethods.map((paymentMethod) => mapPaymentMethodRecord(paymentMethod));
  }

  async findById(paymentMethodId: string) {
    const paymentMethod = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
    return paymentMethod ? mapPaymentMethodRecord(paymentMethod) : null;
  }

  async findDefaultByUserId(userId: string) {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        userId,
        isDefault: true,
        isActive: true
      }
    });

    return paymentMethod ? mapPaymentMethodRecord(paymentMethod) : null;
  }

  async clearDefaultForUser(userId: string) {
    await prisma.paymentMethod.updateMany({
      where: {
        userId,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    });
  }

  async create(data: CreatePaymentMethodInput) {
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: data.userId,
        methodType: data.methodType,
        methodDetails: data.methodDetails,
        isDefault: data.isDefault,
        last4: data.last4,
        brand: data.brand,
        isActive: data.isActive
      }
    });

    return mapPaymentMethodRecord(paymentMethod);
  }

  async update(paymentMethodId: string, data: UpdatePaymentMethodInput) {
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId }
    });

    if (!existingPaymentMethod) {
      return null;
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data
    });

    return mapPaymentMethodRecord(paymentMethod);
  }
}
