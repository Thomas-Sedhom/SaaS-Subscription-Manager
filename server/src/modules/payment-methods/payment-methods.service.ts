import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodsRepository } from './payment-methods.repository';
import type { ResolvedCheckoutPaymentMethod } from './payment-methods.types';

export class PaymentMethodsService {
  constructor(private readonly paymentMethodsRepository: PaymentMethodsRepository) {}

  listMine(currentUser: AuthenticatedRequestUser) {
    return this.paymentMethodsRepository.findByUserId(currentUser.id);
  }

  async create(currentUser: AuthenticatedRequestUser, payload: CreatePaymentMethodDto) {
    if (payload.saveForFuture === false) {
      throw new AppError(
        'Use checkout with a one-time card when you do not want to save it.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingMethods = await this.paymentMethodsRepository.findByUserId(currentUser.id);
    const shouldBeDefault = payload.isDefault ?? existingMethods.length === 0;
    const normalizedCard = this.normalizeCardPayload(payload);

    if (shouldBeDefault) {
      await this.paymentMethodsRepository.clearDefaultForUser(currentUser.id);
    }

    return this.paymentMethodsRepository.create({
      userId: currentUser.id,
      methodType: 'CARD',
      isDefault: shouldBeDefault,
      last4: normalizedCard.last4,
      cardholderName: normalizedCard.cardholderName,
      expiryMonth: normalizedCard.expiryMonth,
      expiryYear: normalizedCard.expiryYear,
      isActive: true
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
  ): Promise<ResolvedCheckoutPaymentMethod> {
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
      if (options.newPaymentMethod.saveForFuture === false) {
        return this.buildTransientCheckoutMethod(currentUser, options.newPaymentMethod);
      }

      return this.create(currentUser, options.newPaymentMethod);
    }

    const defaultPaymentMethod = await this.paymentMethodsRepository.findDefaultByUserId(currentUser.id);

    if (!defaultPaymentMethod) {
      throw new AppError('A payment method is required for checkout', HTTP_STATUS.BAD_REQUEST);
    }

    return defaultPaymentMethod;
  }

  private buildTransientCheckoutMethod(
    currentUser: AuthenticatedRequestUser,
    payload: CreatePaymentMethodDto
  ): ResolvedCheckoutPaymentMethod {
    const normalizedCard = this.normalizeCardPayload(payload);
    const now = new Date();

    return {
      id: null,
      userId: currentUser.id,
      methodType: 'CARD',
      isDefault: false,
      last4: normalizedCard.last4,
      cardholderName: normalizedCard.cardholderName,
      expiryMonth: normalizedCard.expiryMonth,
      expiryYear: normalizedCard.expiryYear,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
  }

  private normalizeCardPayload(payload: CreatePaymentMethodDto) {
    const cardDigits = payload.cardNumber.replace(/\D/g, '');

    if (cardDigits.length < 12 || cardDigits.length > 19) {
      throw new AppError('Card number must be between 12 and 19 digits', HTTP_STATUS.BAD_REQUEST);
    }

    const cardholderName = payload.cardholderName.trim();

    if (!cardholderName) {
      throw new AppError('Cardholder name is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.expiryMonth < 1 || payload.expiryMonth > 12) {
      throw new AppError('Expiry month must be between 1 and 12', HTTP_STATUS.BAD_REQUEST);
    }

    if (!/^\d{3,4}$/.test(payload.cvv)) {
      throw new AppError('CVV must be 3 or 4 digits', HTTP_STATUS.BAD_REQUEST);
    }

    return {
      last4: cardDigits.slice(-4),
      cardholderName,
      expiryMonth: payload.expiryMonth,
      expiryYear: payload.expiryYear
    };
  }
}

export const paymentMethodsService = new PaymentMethodsService(new PaymentMethodsRepository());
