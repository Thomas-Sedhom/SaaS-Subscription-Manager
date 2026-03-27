import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import { paymentMethodsService } from '../payment-methods/payment-methods.service';
import { paymentsService } from '../payments/payments.service';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { ChangePlanDto } from './dto/change-plan.dto';
import type { CreateSubscriptionDto } from './dto/create-subscription.dto';
import type { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { SubscriptionsRepository } from './subscriptions.repository';

export class SubscriptionsService {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async getMySubscriptions(currentUser: AuthenticatedRequestUser) {
    const history = await this.subscriptionsRepository.findByUserId(currentUser.id);
    const currentSubscription = history.find(
      (subscription) => subscription.status === 'ACTIVE' || subscription.status === 'PENDING'
    ) ?? null;

    return {
      currentSubscription,
      history
    };
  }

  async createSubscription(currentUser: AuthenticatedRequestUser, payload: CreateSubscriptionDto) {
    const plan = await this.subscriptionsRepository.findPlanById(payload.planId);

    if (!plan || !plan.isActive) {
      throw new AppError('Selected plan is not available', HTTP_STATUS.BAD_REQUEST);
    }

    const existingSubscription = await this.subscriptionsRepository.findCurrentByUserId(currentUser.id);

    if (existingSubscription) {
      throw new AppError(
        'User already has an active or pending subscription. Change or cancel it first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const paymentMethod = await paymentMethodsService.resolveForCheckout(currentUser, {
      paymentMethodId: payload.paymentMethodId,
      newPaymentMethod: payload.newPaymentMethod
    });

    const subscription = await this.subscriptionsRepository.create({
      userId: currentUser.id,
      planId: payload.planId,
      status: 'PENDING'
    });

    if (!subscription) {
      throw new AppError('Unable to create subscription', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return paymentsService.processNewSubscriptionPayment({
      subscriptionId: subscription.id,
      paymentMethodId: paymentMethod.id,
      simulateFailure: payload.simulateFailure
    });
  }

  async changePlan(
    currentUser: AuthenticatedRequestUser,
    subscriptionId: string,
    payload: ChangePlanDto
  ) {
    const subscription = await this.subscriptionsRepository.findById(subscriptionId);

    if (!subscription || subscription.userId !== currentUser.id) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    if (subscription.status !== 'ACTIVE') {
      throw new AppError('Only active subscriptions can change plans', HTTP_STATUS.BAD_REQUEST);
    }

    if (subscription.planId === payload.newPlanId) {
      throw new AppError('Subscription is already on this plan', HTTP_STATUS.BAD_REQUEST);
    }

    const nextPlan = await this.subscriptionsRepository.findPlanById(payload.newPlanId);

    if (!nextPlan || !nextPlan.isActive) {
      throw new AppError('Selected plan is not available', HTTP_STATUS.BAD_REQUEST);
    }

    const paymentMethod = await paymentMethodsService.resolveForCheckout(currentUser, {
      paymentMethodId: payload.paymentMethodId,
      newPaymentMethod: payload.newPaymentMethod
    });

    return paymentsService.processPlanChangePayment({
      subscriptionId: subscription.id,
      newPlanId: payload.newPlanId,
      paymentMethodId: paymentMethod.id,
      simulateFailure: payload.simulateFailure
    });
  }

  async cancelSubscription(
    currentUser: AuthenticatedRequestUser,
    subscriptionId: string,
    _payload: CancelSubscriptionDto
  ) {
    const subscription = await this.subscriptionsRepository.findById(subscriptionId);

    if (!subscription || subscription.userId !== currentUser.id) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    if (subscription.status === 'CANCELED') {
      throw new AppError('Subscription is already canceled', HTTP_STATUS.BAD_REQUEST);
    }

    const updatedSubscription = await this.subscriptionsRepository.update(subscription.id, {
      status: 'CANCELED',
      endDate: new Date(),
      cancelAtPeriodEnd: false
    });

    if (!updatedSubscription) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    return updatedSubscription;
  }
}

export const subscriptionsService = new SubscriptionsService(new SubscriptionsRepository());