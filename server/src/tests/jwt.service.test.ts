import { describe, expect, it } from 'vitest';

import { jwtService } from '../shared/services/jwt.service';

describe('jwt service', () => {
  it('creates and verifies a JWT payload', () => {
    const token = jwtService.createJWT({
      id: 'user_123',
      email: 'user@example.com',
      role: 'ADMIN'
    });

    const user = jwtService.verifyToken(token);

    expect(user.id).toBe('user_123');
    expect(user.email).toBe('user@example.com');
    expect(user.role).toBe('ADMIN');
  });
});