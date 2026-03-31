import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreatePlanDto } from './dto/create-plan.dto';
import type { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansRepository } from './plans.repository';

export class PlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  listPlans(currentUser: AuthenticatedRequestUser) {
    return this.plansRepository.findAll({
      activeOnly: currentUser.role !== 'ADMIN'
    });
  }

  async getPlanById(planId: string, currentUser: AuthenticatedRequestUser) {
    const plan = await this.plansRepository.findById(planId);

    if (!plan || (currentUser.role !== 'ADMIN' && !plan.isActive)) {
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    return plan;
  }

  async createPlan(payload: CreatePlanDto) {
    const existingPlan = await this.plansRepository.findByName(payload.name);

    if (existingPlan) {
      throw new AppError('A plan with this name already exists', HTTP_STATUS.CONFLICT);
    }

    return this.plansRepository.create({
      name: payload.name,
      description: payload.description?.trim() || undefined,
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

    const updatedPlan = await this.plansRepository.update(planId, {
      name: payload.name,
      description: payload.description !== undefined ? payload.description.trim() : undefined,
      price: payload.price,
      billingCycle: payload.billingCycle,
      features: payload.features,
      isActive: payload.isActive
    });

    if (!updatedPlan) {
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    return updatedPlan;
  }

  async deletePlan(planId: string) {
    const existingPlan = await this.plansRepository.findById(planId);

    if (!existingPlan) {
      throw new AppError('Plan not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.plansRepository.deactivate(planId);
  }
}

export const plansService = new PlansService(new PlansRepository());
