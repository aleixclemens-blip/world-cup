import { z } from "zod";

export const CreateCommentSchema = z.object({
  params: z
    .object({
      fixtureId: z
        .string()
        .regex(/^\d+$/)
        .transform((val) => parseInt(val, 10)),
    })
    .strict(),
  body: z
    .object({
      content: z.string().min(1).max(1000),
    })
    .strict(),
  query: z.object({}).strict().optional(),
});

export const GetCommentsSchema = z.object({
  params: z
    .object({
      fixtureId: z
        .string()
        .regex(/^\d+$/)
        .transform((val) => parseInt(val, 10)),
    })
    .strict(),
  body: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
});

export const DeleteCommentSchema = z.object({
  params: z
    .object({
      fixtureId: z
        .string()
        .regex(/^\d+$/)
        .transform((val) => parseInt(val, 10)),
      commentId: z
        .string()
        .regex(/^\d+$/)
        .transform((val) => parseInt(val, 10)),
    })
    .strict(),
  body: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type GetCommentsInput = z.infer<typeof GetCommentsSchema>;
export type DeleteCommentInput = z.infer<typeof DeleteCommentSchema>;
