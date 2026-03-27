import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreatePaymentDto } from './dto/create-payment.dto';
import type { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsRepository } from './payments.repository';

export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async listBySubscription(currentUser: AuthenticatedRequestUser, subscriptionId: string) {
    const subscription = await this.paymentsRepository.findSubscriptionById(subscriptionId);

    if (!subscription || subscription.userId !== currentUser.id) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.paymentsRepository.findBySubscriptionId(subscriptionId);
  }

  async createPayment(currentUser: AuthenticatedRequestUser, payload: CreatePaymentDto) {
    const subscription = await this.paymentsRepository.findSubscriptionById(payload.subscriptionId);

    if (!subscription || subscription.userId !== currentUser.id) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    const payment = await this.paymentsRepository.create({
      subscriptionId: payload.subscriptionId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      provider: payload.provider,
      status: 'SUCCESS'
    });

    await this.paymentsRepository.updateSubscriptionToActive(payload.subscriptionId);

    return payment;
  }

  async updatePayment(paymentId: string, payload: UpdatePaymentDto) {
    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.paymentsRepository.update(paymentId, {
      status: payload.status
    });
  }
}

export const paymentsService = new PaymentsService(new PaymentsRepository());