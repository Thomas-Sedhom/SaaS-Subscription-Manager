import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { CreatePlanDto } from './dto/create-plan.dto';
import type { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansRepository } from './plans.repository';

export class PlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  listPlans() {
    return this.plansRepository.findAll();
  }

  async createPlan(payload: CreatePlanDto) {
    const existingPlan = await this.plansRepository.findByName(payload.name);

    if (existingPlan) {
      throw new AppError('A plan with this name already exists', HTTP_STATUS.CONFLICT);
    }

    return this.plansRepository.create({
      name: payload.name,
      price: payload.price,
      billingCycle: payload.billingCycle,
      features: payload.features,
      isActive: payload.isActive ?? true
    });
  }

  async updatePlan(planId: string, payload: UpdatePlanDto) {
    const existingPlan = await this.plansRepository.findById(planId);

    if (!existingPlan) {
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    if (payload.name && payload.name !== existingPlan.name) {
      const duplicatePlan = await this.plansRepository.findByName(payload.name);
      if (duplicatePlan) {
        throw new AppError('A plan with this name already exists', HTTP_STATUS.CONFLICT);
      }
    }

    return this.plansRepository.update(planId, {
      name: payload.name,
      price: payload.price,
      billingCycle: payload.billingCycle,
      features: payload.features,
      isActive: payload.isActive
    });
  }

  async deactivatePlan(planId: string) {
    const existingPlan = await this.plansRepository.findById(planId);

    if (!existingPlan) {
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.plansRepository.update(planId, {
      isActive: false
    });
  }
}

export const plansService = new PlansService(new PlansRepository());