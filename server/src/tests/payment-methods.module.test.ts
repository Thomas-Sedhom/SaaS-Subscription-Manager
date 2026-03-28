import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { jwtService } from '../shared/services/jwt.service';
import { prismaMockState, seedPaymentMethods, seedUsers } from './utils/prisma-mock';

describe('payment methods module', () => {
  it('creates and lists payment methods for the authenticated user', async () => {
    seedUsers({
      id: 'user_1',
      name: 'Normal User',
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const userToken = jwtService.createJWT({
      id: 'user_1',
      email: 'user@example.com',
      role: 'USER'
    });

    const app = createApp();
    const createResponse = await request(app)
      .post('/api/v1/payment-methods')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({
        methodType: 'card',
        methodDetails: 'Visa ending 4242',
        isDefault: true,
        last4: '4242',
        brand: 'Visa'
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.isDefault).toBe(true);

    const listResponse = await request(app)
      .get('/api/v1/payment-methods/me')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
  });

  it('sets one payment method as default for the authenticated user', async () => {
    seedUsers({
      id: 'user_1',
      name: 'Normal User',
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    seedPaymentMethods(
      {
        id: 'pm_1',
        userId: 'user_1',
        methodType: 'card',
        methodDetails: 'Visa ending 1111',
        isDefault: true,
        last4: '1111',
        brand: 'Visa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pm_2',
        userId: 'user_1',
        methodType: 'card',
        methodDetails: 'Mastercard ending 2222',
        isDefault: false,
        last4: '2222',
        brand: 'Mastercard',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    const userToken = jwtService.createJWT({
      id: 'user_1',
      email: 'user@example.com',
      role: 'USER'
    });

    const app = createApp();
    const response = await request(app)
      .patch('/api/v1/payment-methods/pm_2/default')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(response.status).toBe(200);
    expect(prismaMockState.paymentMethods.find((method) => method.id === 'pm_1')?.isDefault).toBe(false);
    expect(prismaMockState.paymentMethods.find((method) => method.id === 'pm_2')?.isDefault).toBe(true);
  });
});
