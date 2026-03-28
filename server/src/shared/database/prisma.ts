import { PrismaClient } from '@prisma/client';

import { useInMemoryDatabase } from '../../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

export const prisma = useInMemoryDatabase
  ? null
  : global.__prisma__ ?? createPrismaClient();

if (!useInMemoryDatabase) {
  global.__prisma__ = prisma ?? undefined;
}
