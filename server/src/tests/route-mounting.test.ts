import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app';
import { PlansRepository } from '../modules/plans/plans.repository';

describe('route mounting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mounts the plans route namespace', async () => {
    vi.spyOn(PlansRepository.prototype, 'findAll').mockResolvedValue([]);
    const app = createApp();

    const response = await request(app).get('/api/v1/plans');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('protects authenticated namespaces', async () => {
    const app = createApp();

    const usersResponse = await request(app).get('/api/v1/users/profile');
    const subscriptionsResponse = await request(app).get('/api/v1/subscriptions/my-subscriptions');
    const paymentsResponse = await request(app).post('/api/v1/payments');
    const adminResponse = await request(app).get('/api/v1/admin/dashboard');

    expect(usersResponse.status).toBe(401);
    expect(subscriptionsResponse.status).toBe(401);
    expect(paymentsResponse.status).toBe(401);
    expect(adminResponse.status).toBe(401);
  });
});