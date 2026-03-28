import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'test' | 'production';

const withDefault = (value: string | undefined, fallback: string): string => value ?? fallback;

const normalizeNodeEnv = (value: string | undefined): NodeEnv => {
  if (value === 'production' || value === 'test') {
    return value;
  }

  return 'development';
};

const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV);

const requireRuntimeValue = (value: string | undefined, name: string): string => {
  if (nodeEnv === 'test') {
    return value ?? '';
  }

  if (!value) {
    throw new Error(`${name} is required. Add it to server/.env before starting the server.`);
  }

  return value;
};

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(withDefault(process.env.PORT, '5000')),
  DATABASE_URL: requireRuntimeValue(process.env.DATABASE_URL, 'DATABASE_URL'),
  JWT_SECRET: withDefault(process.env.JWT_SECRET, 'development_jwt_secret'),
  JWT_EXPIRES_IN: withDefault(process.env.JWT_EXPIRES_IN, '7d'),
  CORS_ORIGIN: withDefault(process.env.CORS_ORIGIN, 'http://localhost:3000')
} as const;

export const useInMemoryDatabase = env.NODE_ENV === 'test';
