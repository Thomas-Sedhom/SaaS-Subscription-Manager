import { prisma } from '../../shared/database/prisma';
import { createPlanFeatureCreateInput, mapPlanRecord } from '../../shared/database/prisma-mappers';

interface CreatePlanInput {
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
}

interface UpdatePlanInput {
  name?: string;
  price?: number;
  billingCycle?: 'MONTHLY' | 'YEARLY';
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
    const plans = await prisma.plan.findMany({
      include: planInclude,
      orderBy: { createdAt: 'desc' }
    });

    return plans.map((plan) => mapPlanRecord(plan));
  }

  async findById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: planInclude
    });

    return plan ? mapPlanRecord(plan) : null;
  }

  async findByName(name: string) {
    const plan = await prisma.plan.findUnique({
      where: { name },
      include: planInclude
    });

    return plan ? mapPlanRecord(plan) : null;
  }

  async hasActiveSubscriptions(planId: string) {
    const count = await prisma.subscription.count({
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
    const plan = await prisma.plan.create({
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
    const existingPlan = await prisma.plan.findUnique({ where: { id } });

    if (!existingPlan) {
      return null;
    }

    const updatedPlan = await prisma.$transaction(async (tx) => {
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
    const existingPlan = await prisma.plan.findUnique({ where: { id }, include: planInclude });

    if (!existingPlan) {
      return null;
    }

    await prisma.plan.delete({ where: { id } });
    return mapPlanRecord(existingPlan);
  }
}
