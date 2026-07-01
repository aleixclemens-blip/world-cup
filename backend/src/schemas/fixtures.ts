import { z } from "zod";

export const GetFixturesSchema = z.object({
  query: z
    .object({
      round: z.string().optional(),
      group: z.string().optional(),
      teamId: z
        .string()
        .regex(/^\d+$/)
        .transform((val) => parseInt(val, 10))
        .optional(),
    })
    .strict(),
  body: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export type GetFixtures = z.infer<typeof GetFixturesSchema>;
