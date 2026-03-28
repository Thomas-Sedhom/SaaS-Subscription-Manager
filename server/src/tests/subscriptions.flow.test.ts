import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { jwtService } from '../shared/services/jwt.service';
import {
  prismaMockState,
  seedPaymentMethods,
  seedPlans,
  seedSubscriptions,
  seedUsers
} from './utils/prisma-mock';

describe('subscription and payment flow', () => {
  const seedBaseData = () => {
    seedUsers(
      {
        id: 'user_1',
        name: 'Normal User',
        email: 'user@example.com',
        passwordHash: 'hashed',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'user_2',
        name: 'Other User',
        email: 'other@example.com',
        passwordHash: 'hashed',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    seedPlans(
      {
        id: 'plan_basic',
        name: 'Basic',
        price: 19.99,
        billingCycle: 'MONTHLY',
        features: ['basic'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'plan_pro',
        name: 'Pro',
        price: 49.99,
        billingCycle: 'MONTHLY',
        features: ['pro'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'plan_inactive',
        name: 'Legacy',
        price: 9.99,
        billingCycle: 'MONTHLY',
        features: ['legacy'],
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    seedPaymentMethods(
      {
        id: 'pm_user_1',
        userId: 'user_1',
        methodType: 'card',
        methodDetails: 'Visa ending 4242',
        isDefault: true,
        last4: '4242',
        brand: 'Visa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pm_user_2',
        userId: 'user_2',
        methodType: 'card',
        methodDetails: 'Mastercard ending 5555',
        isDefault: true,
        last4: '5555',
        brand: 'Mastercard',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  };

  it('creates a subscription and activates it after mock payment success', async () => {
    seedBaseData();
    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/subscriptions')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ planId: 'plan_basic', paymentMethodId: 'pm_user_1' });

    expect(response.status).toBe(201);
    expect(response.body.data.subscription.status).toBe('ACTIVE');
    expect(response.body.data.payment.status).toBe('SUCCESS');
  });

  it('fails when the selected plan is inactive', async () => {
    seedBaseData();
    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/subscriptions')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ planId: 'plan_inactive', paymentMethodId: 'pm_user_1' });

    expect(response.status).toBe(400);
  });

  it('fails when the user already has an active or pending subscription', async () => {
    seedBaseData();
    seedSubscriptions({
      id: 'subscription_existing',
      userId: 'user_1',
      planId: 'plan_basic',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/subscriptions')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ planId: 'plan_pro', paymentMethodId: 'pm_user_1' });

    expect(response.status).toBe(400);
  });

  it('changes plan for the authenticated owner and keeps the subscription active', async () => {
    seedBaseData();
    seedSubscriptions({
      id: 'subscription_1',
      userId: 'user_1',
      planId: 'plan_basic',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/subscriptions/subscription_1/change-plan')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ newPlanId: 'plan_pro', paymentMethodId: 'pm_user_1' });

    expect(response.status).toBe(200);
    expect(response.body.data.subscription.planId).toBe('plan_pro');
    expect(response.body.data.subscription.status).toBe('ACTIVE');
    expect(response.body.data.payment.status).toBe('SUCCESS');
  });

  it('keeps the current subscription unchanged when mock payment fails during plan change', async () => {
    seedBaseData();
    seedSubscriptions({
      id: 'subscription_1',
      userId: 'user_1',
      planId: 'plan_basic',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/subscriptions/subscription_1/change-plan')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ newPlanId: 'plan_pro', paymentMethodId: 'pm_user_1', simulateFailure: true });

    expect(response.status).toBe(400);
    expect(prismaMockState.subscriptions.find((subscription) => subscription.id === 'subscription_1')?.planId).toBe('plan_basic');
    expect(prismaMockState.subscriptions.find((subscription) => subscription.id === 'subscription_1')?.status).toBe('ACTIVE');
  });

  it('rejects using a payment method that belongs to another user', async () => {
    seedBaseData();
    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/subscriptions')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ planId: 'plan_basic', paymentMethodId: 'pm_user_2' });

    expect(response.status).toBe(404);
  });

  it('lists only the authenticated user payment history', async () => {
    seedBaseData();
    seedSubscriptions(
      {
        id: 'subscription_1',
        userId: 'user_1',
        planId: 'plan_basic',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'subscription_2',
        userId: 'user_2',
        planId: 'plan_pro',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    await request(app)
      .post('/api/v1/subscriptions/subscription_1/change-plan')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({ newPlanId: 'plan_pro', paymentMethodId: 'pm_user_1' });

    const paymentsResponse = await request(app)
      .get('/api/v1/payments/me')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(paymentsResponse.status).toBe(200);
    expect(paymentsResponse.body.data).toHaveLength(1);
    expect(paymentsResponse.body.data[0].subscription.userId).toBe('user_1');
  });

  it('returns only the authenticated user subscriptions in /subscriptions/me', async () => {
    seedBaseData();
    seedSubscriptions(
      {
        id: 'subscription_1',
        userId: 'user_1',
        planId: 'plan_basic',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'subscription_2',
        userId: 'user_2',
        planId: 'plan_pro',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    const userToken = jwtService.createJWT({ id: 'user_1', email: 'user@example.com', role: 'USER' });

    const app = createApp();
    const response = await request(app)
      .get('/api/v1/subscriptions/me')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(response.status).toBe(200);
    expect(response.body.data.history).toHaveLength(1);
    expect(response.body.data.history[0].userId).toBe('user_1');
  });
});
