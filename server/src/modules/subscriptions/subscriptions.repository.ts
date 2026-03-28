import { prisma } from '../../shared/database/prisma';
import { mapPlanRecord, mapSubscriptionRecord } from '../../shared/database/prisma-mappers';
import { useInMemoryDatabase } from '../../config/env';
import {
  createId,
  paymentStore,
  planStore,
  subscriptionStore,
  userStore
} from '../../shared/database/in-memory-store';
import type { SubscriptionStatus } from '../../shared/database/in-memory-store';

interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
}

interface UpdateSubscriptionInput {
  planId?: string;
  status?: SubscriptionStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

const subscriptionInclude = {
  user: true,
  plan: {
    include: {
      planFeatures: {
        include: {
          feature: true
        }
      }
    }
  },
  payments: true
} as const;

export class SubscriptionsRepository {
  private mapInMemorySubscription(subscription: (typeof subscriptionStore)[number]) {
    return {
      ...subscription,
      user: userStore.find((user) => user.id === subscription.userId) ?? null,
      plan: planStore.find((plan) => plan.id === subscription.planId) ?? null,
      payments: paymentStore.filter((payment) => payment.subscriptionId === subscription.id)
    };
  }

  async findById(id: string) {
    if (useInMemoryDatabase) {
      const subscription = subscriptionStore.find((entry) => entry.id === id) ?? null;
      return subscription ? this.mapInMemorySubscription(subscription) : null;
    }

    const subscription = await prisma!.subscription.findUnique({
      where: { id },
      include: subscriptionInclude
    });

    return subscription ? mapSubscriptionRecord(subscription) : null;
  }

  async findByUserId(userId: string) {
    if (useInMemoryDatabase) {
      return subscriptionStore
        .filter((subscription) => subscription.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((subscription) => this.mapInMemorySubscription(subscription));
    }

    const subscriptions = await prisma!.subscription.findMany({
      where: { userId },
      include: subscriptionInclude,
      orderBy: { createdAt: 'desc' }
    });

    return subscriptions.map((subscription) => mapSubscriptionRecord(subscription));
  }

  async findCurrentByUserId(userId: string) {
    if (useInMemoryDatabase) {
      const subscription =
        subscriptionStore
          .filter(
            (item) => item.userId === userId && (item.status === 'ACTIVE' || item.status === 'PENDING')
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;

      return subscription ? this.mapInMemorySubscription(subscription) : null;
    }

    const subscription = await prisma!.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      },
      include: subscriptionInclude,
      orderBy: { createdAt: 'desc' }
    });

    return subscription ? mapSubscriptionRecord(subscription) : null;
  }

  async findPlanById(planId: string) {
    if (useInMemoryDatabase) {
      return planStore.find((plan) => plan.id === planId) ?? null;
    }

    const plan = await prisma!.plan.findUnique({
      where: { id: planId },
      include: {
        planFeatures: {
          include: {
            feature: true
          }
        }
      }
    });

    return plan ? mapPlanRecord(plan) : null;
  }

  async create(data: CreateSubscriptionInput) {
    if (useInMemoryDatabase) {
      const now = new Date();
      const subscription = {
        id: createId('subscription'),
        userId: data.userId,
        planId: data.planId,
        status: data.status,
        startDate: null,
        endDate: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now
      };

      subscriptionStore.push(subscription);
      return this.findById(subscription.id);
    }

    const subscription = await prisma!.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status
      }
    });

    return this.findById(subscription.id);
  }

  async update(id: string, data: UpdateSubscriptionInput) {
    if (useInMemoryDatabase) {
      const subscription = subscriptionStore.find((entry) => entry.id === id);

      if (!subscription) {
        return null;
      }

      Object.assign(subscription, data, {
        updatedAt: new Date()
      });

      return this.findById(id);
    }

    const existingSubscription = await prisma!.subscription.findUnique({ where: { id } });

    if (!existingSubscription) {
      return null;
    }

    await prisma!.subscription.update({
      where: { id },
      data
    });

    return this.findById(id);
  }
}
