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

export class PlansRepository {
  findAll() {
    return Promise.resolve([...planStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }

  findById(id: string) {
    return Promise.resolve(planStore.find((plan) => plan.id === id) ?? null);
  }

  findByName(name: string) {
    return Promise.resolve(planStore.find((plan) => plan.name === name) ?? null);
  }

  hasActiveSubscriptions(planId: string) {
    return Promise.resolve(
      subscriptionStore.some(
        (subscription) =>
          subscription.planId === planId &&
          (subscription.status === 'ACTIVE' || subscription.status === 'PENDING')
      )
    );
  }

  create(data: CreatePlanInput) {
    const now = new Date();
    const plan = {
      id: createId('plan'),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    planStore.push(plan);
    return Promise.resolve(plan);
  }

  update(id: string, data: UpdatePlanInput) {
    const plan = planStore.find((entry) => entry.id === id);

    if (!plan) {
      return Promise.resolve(null);
    }

    Object.assign(plan, data, {
      updatedAt: new Date()
    });

    return Promise.resolve(plan);
  }

  delete(id: string) {
    const index = planStore.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return Promise.resolve(null);
    }

    const [deletedPlan] = planStore.splice(index, 1);
    return Promise.resolve(deletedPlan);
  }
}