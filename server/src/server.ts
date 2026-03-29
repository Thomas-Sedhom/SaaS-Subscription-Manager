import { createServer } from 'node:http';

import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './shared/database/prisma';

const startServer = async () => {
  if (prisma) {
    await prisma.$connect();
  }

  const app = createApp();
  const server = createServer(app);

  const shutdown = async () => {
    server.close(async () => {
      if (prisma) {
        await prisma.$disconnect();
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });

  server.listen(env.PORT);
};

startServer().catch(() => {
  process.exit(1);
});
