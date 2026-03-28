import { PrismaClient } from '@prisma/client';

import { env } from '../../config/env';
import { prismaMock } from '../../tests/utils/prisma-mock';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

export const prisma =
  env.NODE_ENV === 'test'
    ? prismaMock
    : global.__prisma__ ?? createPrismaClient();

if (env.NODE_ENV !== 'test') {
  global.__prisma__ = prisma;
}
