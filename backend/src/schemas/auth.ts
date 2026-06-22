import { z } from 'zod';

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }).strict(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }).strict(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});
