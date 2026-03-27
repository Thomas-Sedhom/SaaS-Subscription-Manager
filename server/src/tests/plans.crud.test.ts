import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { planStore, resetInMemoryStore, userStore } from '../shared/database/in-memory-store';
import { jwtService } from '../shared/services/jwt.service';

describe('plans module', () => {
  beforeEach(() => {
    resetInMemoryStore();

    userStore.push(
      {
        id: 'admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'hashed',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'user_1',
        name: 'Normal User',
        email: 'user@example.com',
        passwordHash: 'hashed',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    planStore.push({
      id: 'plan_1',
      name: 'Starter',
      price: 19.99,
      billingCycle: 'MONTHLY',
      features: ['basic'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it('allows any authenticated role to get plans', async () => {
    const userToken = jwtService.createJWT({
      id: 'user_1',
      email: 'user@example.com',
      role: 'USER'
    });

    const app = createApp();
    const listResponse = await request(app)
      .get('/api/v1/plans')
      .set('Cookie', [`accessToken=${userToken}`]);
    const detailResponse = await request(app)
      .get('/api/v1/plans/plan_1')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.id).toBe('plan_1');
  });

  it('allows only admins to create, update, and delete plans', async () => {
    const adminToken = jwtService.createJWT({
      id: 'admin_1',
      email: 'admin@example.com',
      role: 'ADMIN'
    });
    const userToken = jwtService.createJWT({
      id: 'user_1',
      email: 'user@example.com',
      role: 'USER'
    });

    const app = createApp();

    const forbiddenCreate = await request(app)
      .post('/api/v1/plans')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({
        name: 'Pro',
        price: 49.99,
        billingCycle: 'MONTHLY',
        features: ['priority-support'],
        isActive: true
      });

    expect(forbiddenCreate.status).toBe(403);

    const createResponse = await request(app)
      .post('/api/v1/plans')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        name: 'Pro',
        price: 49.99,
        billingCycle: 'MONTHLY',
        features: ['priority-support'],
        isActive: true
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body.data.id;

    const updateResponse = await request(app)
      .patch(`/api/v1/plans/${createdId}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        price: 59.99,
        isActive: false
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.price).toBe(59.99);
    expect(updateResponse.body.data.isActive).toBe(false);

    const deleteResponse = await request(app)
      .delete(`/api/v1/plans/${createdId}`)
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.id).toBe(createdId);
  });
});