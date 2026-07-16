import { Request, Response } from "express";
import { TeamsService } from "../services/teams";
import { AddFavoriteTeam, RemoveFavoriteTeam, GetTeams } from "../schemas/teams";

export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  getTeams = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as GetTeams;
    const name = parsed?.query?.name;
    const orderBy = parsed?.query?.orderBy;
    const orderDir = parsed?.query?.orderDir;
    const teams = await this.teamsService.getTeamsWithGroups(name, orderBy, orderDir);
    res.status(200).json(teams);
  };

  addFavoriteTeam = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as AddFavoriteTeam;
    const userId = req.user!.id;
    await this.teamsService.addFavoriteTeam(userId, parsed.body.teamId);
    res.status(201).json({ message: "Team added to favorites successfully" });
  };

  getFavoriteTeams = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const favorites = await this.teamsService.getFavoriteTeams(userId);
    res.status(200).json(favorites);
  };

  removeFavoriteTeam = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as RemoveFavoriteTeam;
    const userId = req.user!.id;
    await this.teamsService.removeFavoriteTeam(userId, parsed.body.teamId);
    res.status(200).json({ message: "Team removed from favorites successfully" });
  };
}
