import { Request, Response } from "express";
import { FixturesService } from "../services/fixtures";
import { GetFixtures, GetFixtureById } from "../schemas/fixtures";
import { NotFoundError } from "../lib/errors";

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

  getFixtureById = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as GetFixtureById;
    const { id } = parsed.params;
    const fixture = await this.fixturesService.getFixtureById(id);
    if (!fixture) {
      throw new NotFoundError(`Fixture with ID ${id} not found`);
    }
    res.status(200).json(fixture);
  };
}

