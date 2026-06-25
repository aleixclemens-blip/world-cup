import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().default(7000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),
  MYSQL_HOST: z.string(),
  MYSQL_USERNAME: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DB: z.string(),
  COOKIE_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESES_TOKEN_EXPIRE: z.string(),
  REFRESH_TOKEN_EXPIRE: z.string(),
});

const result = configSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid configuration keys:', result.error.format());
  throw new Error('Invalid configuration on boot');
}

export const config = result.data;
