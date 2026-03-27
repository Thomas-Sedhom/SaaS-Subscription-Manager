import { createServer } from 'node:http';

import { createApp } from './app';
import { env } from './config/env';

const startServer = async () => {
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});