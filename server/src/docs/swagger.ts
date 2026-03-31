import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './swagger-document';

const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'SaaS Subscription Manager API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list'
  }
};

export const registerSwagger = (app: Express) => {
  app.get('/docs.json', (_req: Request, res: Response) => {
    res.status(200).json(openApiDocument);
  });

  app.use('/docs', swaggerUi.serveFiles(openApiDocument, swaggerUiOptions));
  app.get('/docs', swaggerUi.setup(openApiDocument, swaggerUiOptions));
  app.get('/docs/', swaggerUi.setup(openApiDocument, swaggerUiOptions));
};
