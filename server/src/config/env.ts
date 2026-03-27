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

export const env = {
  NODE_ENV: normalizeNodeEnv(process.env.NODE_ENV),
  PORT: Number(withDefault(process.env.PORT, '5000')),
  JWT_SECRET: withDefault(process.env.JWT_SECRET, 'development_jwt_secret'),
  JWT_EXPIRES_IN: withDefault(process.env.JWT_EXPIRES_IN, '7d'),
  CORS_ORIGIN: withDefault(process.env.CORS_ORIGIN, 'http://localhost:3000')
} as const;