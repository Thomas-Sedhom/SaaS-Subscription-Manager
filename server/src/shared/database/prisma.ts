import { PrismaClient } from '@prisma/client';

import { env } from '../../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

export const prisma = global.__prisma__ ?? createPrismaClient();

global.__prisma__ = prisma;
