import { HTTP_STATUS } from '../../shared/constants/http-status';
import { prisma } from '../../shared/database/prisma';
import { createPlanFeatureCreateInput, mapPlanRecord } from '../../shared/database/prisma-mappers';
import { AppError } from '../../shared/errors/app-error';

interface CreatePlanInput {
  name: string;
  description?: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
}

interface UpdatePlanInput {
  name?: string;
  description?: string;
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
  async findAll(options?: { activeOnly?: boolean }) {
    const plans = await prisma.plan.findMany({
      where: options?.activeOnly ? { isActive: true } : undefined,
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
        description: data.description,
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
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    const updatedPlan = await prisma.$transaction(async (tx) => {
      if (data.features) {
        await tx.planFeature.deleteMany({ where: { planId: id } });
      }

      return tx.plan.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
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

  async deactivate(id: string) {
    const existingPlan = await prisma.plan.findUnique({ where: { id }, include: planInclude });

    if (!existingPlan) {
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: { isActive: false },
      include: planInclude
    });

    return mapPlanRecord(plan);
  }
}
