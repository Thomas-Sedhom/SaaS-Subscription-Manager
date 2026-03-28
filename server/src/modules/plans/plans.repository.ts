import { prisma } from '../../shared/database/prisma';
import { createPlanFeatureCreateInput, mapPlanRecord } from '../../shared/database/prisma-mappers';
import { useInMemoryDatabase } from '../../config/env';
import { createId, planStore, subscriptionStore } from '../../shared/database/in-memory-store';
import type { PlanRecord } from '../../shared/database/in-memory-store';

interface CreatePlanInput {
  name: string;
  price: number;
  billingCycle: PlanRecord['billingCycle'];
  features: string[];
  isActive: boolean;
}

interface UpdatePlanInput {
  name?: string;
  price?: number;
  billingCycle?: PlanRecord['billingCycle'];
  features?: string[];
  isActive?: boolean;
}

const planInclude = {
  planFeatures: {
    include: {
      feature: true
    }
  }
} as const;

export class PlansRepository {
  async findAll() {
    if (useInMemoryDatabase) {
      return [...planStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const plans = await prisma!.plan.findMany({
      include: planInclude,
      orderBy: { createdAt: 'desc' }
    });

    return plans.map((plan) => mapPlanRecord(plan));
  }

  async findById(id: string) {
    if (useInMemoryDatabase) {
      return planStore.find((plan) => plan.id === id) ?? null;
    }

    const plan = await prisma!.plan.findUnique({
      where: { id },
      include: planInclude
    });

    return plan ? mapPlanRecord(plan) : null;
  }

  async findByName(name: string) {
    if (useInMemoryDatabase) {
      return planStore.find((plan) => plan.name === name) ?? null;
    }

    const plan = await prisma!.plan.findUnique({
      where: { name },
      include: planInclude
    });

    return plan ? mapPlanRecord(plan) : null;
  }

  async hasActiveSubscriptions(planId: string) {
    if (useInMemoryDatabase) {
      return subscriptionStore.some(
        (subscription) =>
          subscription.planId === planId &&
          (subscription.status === 'ACTIVE' || subscription.status === 'PENDING')
      );
    }

    const count = await prisma!.subscription.count({
      where: {
        planId,
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      }
    });

    return count > 0;
  }

  async create(data: CreatePlanInput) {
    if (useInMemoryDatabase) {
      const now = new Date();
      const plan = {
        id: createId('plan'),
        ...data,
        createdAt: now,
        updatedAt: now
      };

      planStore.push(plan);
      return plan;
    }

    const plan = await prisma!.plan.create({
      data: {
        name: data.name,
        price: data.price,
        billingCycle: data.billingCycle,
        isActive: data.isActive,
        planFeatures: {
          create: createPlanFeatureCreateInput(data.features)
        }
      },
      include: planInclude
    });

    return mapPlanRecord(plan);
  }

  async update(id: string, data: UpdatePlanInput) {
    if (useInMemoryDatabase) {
      const plan = planStore.find((entry) => entry.id === id);

      if (!plan) {
        return null;
      }

      Object.assign(plan, data, {
        updatedAt: new Date()
      });

      return plan;
    }

    const existingPlan = await prisma!.plan.findUnique({ where: { id } });

    if (!existingPlan) {
      return null;
    }

    const updatedPlan = await prisma!.$transaction(async (tx) => {
      if (data.features) {
        await tx.planFeature.deleteMany({ where: { planId: id } });
      }

      return tx.plan.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.billingCycle !== undefined ? { billingCycle: data.billingCycle } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.features
            ? {
                planFeatures: {
                  create: createPlanFeatureCreateInput(data.features)
                }
              }
            : {})
        },
        include: planInclude
      });
    });

    return mapPlanRecord(updatedPlan);
  }

  async delete(id: string) {
    if (useInMemoryDatabase) {
      const index = planStore.findIndex((entry) => entry.id === id);

      if (index === -1) {
        return null;
      }

      const [deletedPlan] = planStore.splice(index, 1);
      return deletedPlan;
    }

    const existingPlan = await prisma!.plan.findUnique({ where: { id }, include: planInclude });

    if (!existingPlan) {
      return null;
    }

    await prisma!.plan.delete({ where: { id } });
    return mapPlanRecord(existingPlan);
  }
}
