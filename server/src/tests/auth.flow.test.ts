import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { resetInMemoryStore } from '../shared/database/in-memory-store';

describe('auth module', () => {
  beforeEach(() => {
    resetInMemoryStore();
  });

  it('signs up a user, stores a jwt cookie, and returns the token', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'strongpass'
    });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.headers['set-cookie']?.[0]).toContain('accessToken=');
  });

  it('logs in a user and returns a cookie-backed session token', async () => {
    const app = createApp();

    await request(app).post('/api/v1/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'strongpass'
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'strongpass'
    });

    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.headers['set-cookie']?.[0]).toContain('accessToken=');
  });

  it('logs out a user by clearing the auth cookie', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User logged out successfully');
    expect(response.headers['set-cookie']?.[0]).toContain('accessToken=;');
  });
});