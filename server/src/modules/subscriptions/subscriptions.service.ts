import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreateSubscriptionDto } from './dto/create-subscription.dto';
import type { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsRepository } from './subscriptions.repository';

export class SubscriptionsService {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  listUserSubscriptions(currentUser: AuthenticatedRequestUser) {
    return this.subscriptionsRepository.findByUserId(currentUser.id);
  }

  async createSubscription(currentUser: AuthenticatedRequestUser, payload: CreateSubscriptionDto) {
    const plan = await this.subscriptionsRepository.findPlanById(payload.planId);

    if (!plan || !plan.isActive) {
      throw new AppError('Selected plan is not available', HTTP_STATUS.BAD_REQUEST);
    }

    const existingSubscription = await this.subscriptionsRepository.findCurrentByUserId(currentUser.id);

    if (existingSubscription) {
      throw new AppError(
        'User already has an active or pending subscription. Upgrade or cancel it first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return this.subscriptionsRepository.create({
      userId: currentUser.id,
      planId: payload.planId,
      status: 'PENDING'
    });
  }

  async updateSubscription(
    currentUser: AuthenticatedRequestUser,
    subscriptionId: string,
    payload: UpdateSubscriptionDto
  ) {
    const subscription = await this.subscriptionsRepository.findById(subscriptionId);

    if (!subscription || subscription.userId !== currentUser.id) {
      throw new AppError('Subscription not found', HTTP_STATUS.NOT_FOUND);
    }

    if (payload.planId) {
      const nextPlan = await this.subscriptionsRepository.findPlanById(payload.planId);
      if (!nextPlan || !nextPlan.isActive) {
        throw new AppError('Selected plan is not available', HTTP_STATUS.BAD_REQUEST);
      }
    }

    return this.subscriptionsRepository.update(subscriptionId, {
      planId: payload.planId,
      status: payload.status,
      endDate:
        payload.status === 'CANCELED' || payload.status === 'EXPIRED' ? new Date() : subscription.endDate
    });
  }
}

export const subscriptionsService = new SubscriptionsService(new SubscriptionsRepository());