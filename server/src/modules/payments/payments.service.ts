import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import { SubscriptionsRepository } from '../subscriptions/subscriptions.repository';
import { PaymentsRepository } from './payments.repository';

export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository
  ) {}

  listMine(currentUser: AuthenticatedRequestUser) {
    return this.paymentsRepository.findByUserId(currentUser.id);
  }

  async processNewSubscriptionPayment(options: {
    subscriptionId: string;
    paymentMethodId: string;
    simulateFailure?: boolean;
  }) {
    const subscription = await this.subscriptionsRepository.findById(options.subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!subscription.plan) {
      throw new AppError('Plan not found for subscription', HTTP_STATUS.NOT_FOUND);
    }

    const payment = await this.paymentsRepository.create({
      subscriptionId: subscription.id,
      paymentMethodId: options.paymentMethodId,
      amount: subscription.plan.price,
      currency: 'USD',
      provider: options.simulateFailure ? 'mock-fail' : 'mock-success',
      status: 'PENDING',
      failureReason: null,
      type: 'SUBSCRIPTION_CREATE',
      targetPlanId: null
    });

    if (!payment) {
      throw new AppError('Unable to create payment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    if (options.simulateFailure) {
      await this.paymentsRepository.update(payment.id, {
        status: 'FAILED',
        failureReason: 'Mock payment failed during subscription creation'
      });

      throw new AppError('Mock payment failed', HTTP_STATUS.BAD_REQUEST);
    }

    await this.paymentsRepository.update(payment.id, {
      status: 'SUCCESS',
      failureReason: null
    });

    const now = new Date();
    const currentPeriodEnd = this.calculatePeriodEnd(now, subscription.plan.billingCycle);
    const updatedSubscription = await this.subscriptionsRepository.update(subscription.id, {
      status: 'ACTIVE',
      startDate: subscription.startDate ?? now,
      currentPeriodStart: now,
      currentPeriodEnd,
      endDate: null,
      cancelAtPeriodEnd: false
    });

    if (!updatedSubscription) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    const successfulPayment = await this.paymentsRepository.findById(payment.id);

    return {
      payment: successfulPayment,
      subscription: updatedSubscription
    };
  }

  async processPlanChangePayment(options: {
    subscriptionId: string;
    newPlanId: string;
    paymentMethodId: string;
    simulateFailure?: boolean;
  }) {
    const subscription = await this.subscriptionsRepository.findById(options.subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    const targetPlan = await this.subscriptionsRepository.findPlanById(options.newPlanId);

    if (!targetPlan) {
      throw new AppError('Target plan not found', HTTP_STATUS.NOT_FOUND);
    }

    const payment = await this.paymentsRepository.create({
      subscriptionId: subscription.id,
      paymentMethodId: options.paymentMethodId,
      amount: targetPlan.price,
      currency: 'USD',
      provider: options.simulateFailure ? 'mock-fail' : 'mock-success',
      status: 'PENDING',
      failureReason: null,
      type: 'PLAN_CHANGE',
      targetPlanId: options.newPlanId
    });

    if (!payment) {
      throw new AppError('Unable to create payment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    if (options.simulateFailure) {
      await this.paymentsRepository.update(payment.id, {
        status: 'FAILED',
        failureReason: 'Mock payment failed during plan change'
      });

      throw new AppError('Mock payment failed', HTTP_STATUS.BAD_REQUEST);
    }

    await this.paymentsRepository.update(payment.id, {
      status: 'SUCCESS',
      failureReason: null
    });

    const now = new Date();
    const currentPeriodEnd = this.calculatePeriodEnd(now, targetPlan.billingCycle);
    const updatedSubscription = await this.subscriptionsRepository.update(subscription.id, {
      planId: targetPlan.id,
      status: 'ACTIVE',
      startDate: subscription.startDate ?? now,
      currentPeriodStart: now,
      currentPeriodEnd,
      endDate: null,
      cancelAtPeriodEnd: false
    });

    if (!updatedSubscription) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    const successfulPayment = await this.paymentsRepository.findById(payment.id);

    return {
      payment: successfulPayment,
      subscription: updatedSubscription
    };
  }

  private calculatePeriodEnd(startDate: Date, billingCycle: 'MONTHLY' | 'YEARLY') {
    const endDate = new Date(startDate);

    if (billingCycle === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      return endDate;
    }

    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }
}

export const paymentsService = new PaymentsService(
  new PaymentsRepository(),
  new SubscriptionsRepository()
);