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
  SECRET_KEY: z.string(),
});

const result = configSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid configuration keys:', result.error.format());
  throw new Error('Invalid configuration on boot');
}

export const config = result.data;
