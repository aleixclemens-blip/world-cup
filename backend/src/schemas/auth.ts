import { z } from "zod";

export const RegisterSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(150),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    })
    .strict(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const LoginSchema = z.object({
  body: z
    .object({
      email: z.string().min(1).optional(),
      username: z.string().min(1).optional(),
      password: z.string(),
    })
    .strict()
    .refine((data) => data.email || data.username, {
      message: "Either email or username must be provided",
      path: ["email"],
    }),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});
