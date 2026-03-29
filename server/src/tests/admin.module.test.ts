import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { jwtService } from '../shared/services/jwt.service';
import { prismaMockState, seedUsers } from './utils/prisma-mock';

describe('admin module', () => {
  it('allows an existing admin to create another admin account', async () => {
    seedUsers({
      id: 'admin_1',
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'hashed-admin',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const adminToken = jwtService.createJWT({
      id: 'admin_1',
      email: 'admin@example.com',
      role: 'ADMIN'
    });

    const app = createApp();
    const response = await request(app)
      .post('/api/v1/admin/admins')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        name: 'Second Admin',
        email: 'second-admin@example.com',
        password: 'strongpass'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.role).toBe('ADMIN');
    expect(response.body.data.email).toBe('second-admin@example.com');
    expect(prismaMockState.users).toHaveLength(2);
    expect(prismaMockState.users[1]?.role).toBe('ADMIN');
  });
});
