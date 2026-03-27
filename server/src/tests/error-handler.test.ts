import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app';
import { authService } from '../modules/auth/auth.service';

describe('error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 404 for unknown routes', async () => {
    const app = createApp();

    const response = await request(app).get('/api/v1/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('returns 500 for unexpected exceptions', async () => {
    vi.spyOn(authService, 'login').mockRejectedValueOnce(new Error('Unexpected failure'));
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'strongpassword'
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});