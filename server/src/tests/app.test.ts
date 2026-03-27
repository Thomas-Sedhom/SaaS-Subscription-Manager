import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';

describe('app bootstrap', () => {
  it('returns API metadata from the root route', async () => {
    const app = createApp();

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.version).toBe('1.0.0');
  });
});