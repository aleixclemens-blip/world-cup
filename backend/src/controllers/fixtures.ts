import { Request, Response } from "express";
import { FixturesService } from "../services/fixtures";
import { GetFixtures } from "../schemas/fixtures";

export class FixturesController {
  constructor(private fixturesService: FixturesService) {}

  getFixtures = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as GetFixtures;
    const query = parsed?.query || {};
    const fixtures = await this.fixturesService.getFixtures({
      round: query.round,
      group: query.group,
      teamId: query.teamId,
    });
    res.status(200).json(fixtures);
  };
}
