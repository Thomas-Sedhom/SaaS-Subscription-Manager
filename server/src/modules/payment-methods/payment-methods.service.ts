import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodsRepository } from './payment-methods.repository';

export class PaymentMethodsService {
  constructor(private readonly paymentMethodsRepository: PaymentMethodsRepository) {}

  listMine(currentUser: AuthenticatedRequestUser) {
    return this.paymentMethodsRepository.findByUserId(currentUser.id);
  }

  async create(currentUser: AuthenticatedRequestUser, payload: CreatePaymentMethodDto) {
    const existingMethods = await this.paymentMethodsRepository.findByUserId(currentUser.id);
    const shouldBeDefault = payload.isDefault ?? existingMethods.length === 0;

    if (shouldBeDefault) {
      await this.paymentMethodsRepository.clearDefaultForUser(currentUser.id);
    }

    return this.paymentMethodsRepository.create({
      userId: currentUser.id,
      methodType: payload.methodType,
      methodDetails: payload.methodDetails,
      isDefault: shouldBeDefault,
      last4: payload.last4 ?? null,
      brand: payload.brand ?? null,
      isActive: payload.isActive ?? true
    });
  }

  async setDefault(currentUser: AuthenticatedRequestUser, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodsRepository.findById(paymentMethodId);

    if (!paymentMethod || paymentMethod.userId !== currentUser.id) {
      throw new AppError('Payment method not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!paymentMethod.isActive) {
      throw new AppError('Payment method is not active', HTTP_STATUS.BAD_REQUEST);
    }

    await this.paymentMethodsRepository.clearDefaultForUser(currentUser.id);
    const updatedMethod = await this.paymentMethodsRepository.update(paymentMethodId, {
      isDefault: true
    });

    if (!updatedMethod) {
      throw new AppError('Payment method not found', HTTP_STATUS.NOT_FOUND);
    }

    return updatedMethod;
  }

  async resolveForCheckout(
    currentUser: AuthenticatedRequestUser,
    options: {
      paymentMethodId?: string;
      newPaymentMethod?: CreatePaymentMethodDto;
    }
  ) {
    if (options.paymentMethodId && options.newPaymentMethod) {
      throw new AppError(
        'Provide either paymentMethodId or newPaymentMethod, not both',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (options.paymentMethodId) {
      const paymentMethod = await this.paymentMethodsRepository.findById(options.paymentMethodId);

      if (!paymentMethod || paymentMethod.userId !== currentUser.id) {
        throw new AppError('Payment method not found', HTTP_STATUS.NOT_FOUND);
      }

      if (!paymentMethod.isActive) {
        throw new AppError('Payment method is not active', HTTP_STATUS.BAD_REQUEST);
      }

      return paymentMethod;
    }

    if (options.newPaymentMethod) {
      return this.create(currentUser, options.newPaymentMethod);
    }

    const defaultPaymentMethod = await this.paymentMethodsRepository.findDefaultByUserId(currentUser.id);

    if (!defaultPaymentMethod) {
      throw new AppError('A payment method is required for checkout', HTTP_STATUS.BAD_REQUEST);
    }

    return defaultPaymentMethod;
  }
}

export const paymentMethodsService = new PaymentMethodsService(new PaymentMethodsRepository());