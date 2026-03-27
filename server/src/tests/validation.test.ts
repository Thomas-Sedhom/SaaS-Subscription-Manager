import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';

describe('validation middleware', () => {
  it('rejects invalid auth registration payloads', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'invalid-email',
      password: '123'
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});