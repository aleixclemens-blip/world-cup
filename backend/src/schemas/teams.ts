import { z } from "zod";

export const AddFavoriteTeamSchema = z.object({
  body: z
    .object({
      teamId: z.number().int().positive(),
    })
    .strict(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const RemoveFavoriteTeamSchema = AddFavoriteTeamSchema;

export type AddFavoriteTeam = z.infer<typeof AddFavoriteTeamSchema>;
export type RemoveFavoriteTeam = z.infer<typeof RemoveFavoriteTeamSchema>;

export const GetTeamsSchema = z.object({
  query: z
    .object({
      name: z.string().optional(),
    })
    .strict(),
  body: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export type GetTeams = z.infer<typeof GetTeamsSchema>;



