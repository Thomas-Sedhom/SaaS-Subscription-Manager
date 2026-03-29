import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { appConfig } from './config/app.config';
import { env } from './config/env';
import { registerRoutes } from './routes';
import { errorHandler } from './shared/errors/error-handler';
import { notFoundMiddleware } from './shared/middlewares/not-found.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: appConfig.name,
      data: {
        version: appConfig.version
      }
    });
  });

  registerRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
};
