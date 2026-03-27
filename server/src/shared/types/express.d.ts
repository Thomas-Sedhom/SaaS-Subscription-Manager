import type { AuthenticatedRequestUser } from './common.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}

export {};