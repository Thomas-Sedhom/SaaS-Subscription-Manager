import { beforeEach } from 'vitest';

import { resetPrismaMock } from './utils/prisma-mock';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.DIRECT_URL = process.env.DIRECT_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

beforeEach(() => {
  resetPrismaMock();
});
