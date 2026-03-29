import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app';
import { authService } from '../modules/auth/auth.service';
import { jwtService } from '../shared/services/jwt.service';

describe('auth routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('signs up a user, stores a jwt cookie, and returns the token', async () => {
    vi.spyOn(authService, 'signup').mockResolvedValueOnce({
      token: 'signup-token',
      user: {
        id: 'user_1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER'
      }
    });

    const app = createApp();

    const response = await request(app).post('/api/v1/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'strongpass'
    });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.token).toBe('signup-token');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.headers['set-cookie']?.[0]).toContain('accessToken=signup-token');
  });

  it('logs in a user and returns a cookie-backed session token', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce({
      token: 'login-token',
      user: {
        id: 'admin_1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    });

    const app = createApp();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'strongpass'
    });

    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.token).toBe('login-token');
    expect(response.body.user.role).toBe('ADMIN');
    expect(response.headers['set-cookie']?.[0]).toContain('accessToken=login-token');
  });

  it('returns the authenticated user from the jwt cookie on /auth/me', async () => {
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
      id: 'user_1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER'
    });

    const token = jwtService.createJWT({
      id: 'user_1',
      email: 'test@example.com',
      role: 'USER'
    });

    const app = createApp();

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`accessToken=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe('user_1');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('logs out a user by clearing the auth cookie', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User logged out successfully');
    expect(response.headers['set-cookie']?.[0]).toContain('accessToken=;');
  });
});
