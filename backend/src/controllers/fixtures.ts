import { Request, Response } from "express";
import { FixturesService } from "../services/fixtures";
import { GetFixtures, GetFixtureById } from "../schemas/fixtures";
import { NotFoundError } from "../lib/errors";

export class FixturesController {
  constructor(private fixturesService: FixturesService) {}

  getFixtures = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as GetFixtures;
    const query = parsed?.query || {};
    const filters: { round?: string; group?: string; teamId?: number } = {};
    if (query.round !== undefined) filters.round = query.round;
    if (query.group !== undefined) filters.group = query.group;
    if (query.teamId !== undefined) filters.teamId = query.teamId;

    const fixtures = await this.fixturesService.getFixtures(filters);
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

