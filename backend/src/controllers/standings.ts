import { Request, Response } from "express";
import { StandingsService } from "../services/standings";

export class StandingsController {
  constructor(private standingsService: StandingsService) {}

  getStandings = async (req: Request, res: Response): Promise<void> => {
    const standings = await this.standingsService.getStandingsList();
    res.status(200).json(standings);
  };
}
