import { prisma } from '../../shared/database/prisma';
import { mapPlanRecord, mapSubscriptionRecord } from '../../shared/database/prisma-mappers';

interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
}

interface UpdateSubscriptionInput {
  planId?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
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
  async findById(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: subscriptionInclude
    });

    return subscription ? mapSubscriptionRecord(subscription) : null;
  }

  async findByUserId(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: subscriptionInclude,
      orderBy: { createdAt: 'desc' }
    });

    return subscriptions.map((subscription) => mapSubscriptionRecord(subscription));
  }

  async findCurrentByUserId(userId: string) {
    const subscription = await prisma.subscription.findFirst({
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

  async findPendingByUserId(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'PENDING'
      },
      include: subscriptionInclude,
      orderBy: { createdAt: 'desc' }
    });

    return subscription ? mapSubscriptionRecord(subscription) : null;
  }

  async findPlanById(planId: string) {
    const plan = await prisma.plan.findUnique({
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
    const subscription = await prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status
      }
    });

    return this.findById(subscription.id);
  }

  async update(id: string, data: UpdateSubscriptionInput) {
    const existingSubscription = await prisma.subscription.findUnique({ where: { id } });

    if (!existingSubscription) {
      return null;
    }

    await prisma.subscription.update({
      where: { id },
      data
    });

    return this.findById(id);
  }
}
