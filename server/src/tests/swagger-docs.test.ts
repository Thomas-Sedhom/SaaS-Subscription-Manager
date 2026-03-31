import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';

describe('swagger docs', () => {
  it('serves the raw OpenAPI document', async () => {
    const app = createApp();

    const response = await request(app).get('/docs.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info.title).toBe('SaaS Subscription Manager API');
    expect(response.body.paths['/api/v1/auth/login']).toBeDefined();
  });

  it('serves the swagger ui page', async () => {
    const app = createApp();

    const response = await request(app).get('/docs');

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('/docs/');
  });
});
