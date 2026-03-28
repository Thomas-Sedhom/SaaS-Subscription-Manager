import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { jwtService } from '../shared/services/jwt.service';
import { seedUsers } from './utils/prisma-mock';

describe('users module', () => {
  it('allows only admin to get all users and get a user by id', async () => {
    seedUsers(
      {
        id: 'admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'hashed-admin',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'user_1',
        name: 'Normal User',
        email: 'user@example.com',
        passwordHash: 'hashed-user',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

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

    const forbiddenListResponse = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(forbiddenListResponse.status).toBe(403);

    const listResponse = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(2);
    expect(listResponse.body.data[0].passwordHash).toBeUndefined();

    const detailResponse = await request(app)
      .get('/api/v1/users/user_1')
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.id).toBe('user_1');
    expect(detailResponse.body.data.passwordHash).toBeUndefined();
  });

  it('gets and updates the current user profile from the JWT cookie', async () => {
    seedUsers(
      {
        id: 'admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'hashed-admin',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'user_1',
        name: 'Normal User',
        email: 'user@example.com',
        passwordHash: 'hashed-user',
        role: 'USER',
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

    const profileResponse = await request(app)
      .get('/api/v1/users/profile')
      .set('Cookie', [`accessToken=${userToken}`]);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.data.id).toBe('user_1');
    expect(profileResponse.body.data.passwordHash).toBeUndefined();

    const updateResponse = await request(app)
      .patch('/api/v1/users/profile')
      .set('Cookie', [`accessToken=${userToken}`])
      .send({
        name: 'Updated User',
        email: 'updated@example.com'
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toBe('Updated User');
    expect(updateResponse.body.data.email).toBe('updated@example.com');
    expect(updateResponse.body.data.passwordHash).toBeUndefined();
  });
});
