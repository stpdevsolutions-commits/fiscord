import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()),
  isDev: (process.env.NODE_ENV || 'development') === 'development',
} as const;
