import { Repository } from "typeorm";
import { Standing } from "../entities/Standing";

export class StandingsService {
  constructor(private standingRepository: Repository<Standing>) {}

  async getStandingsList(): Promise<Standing[]> {
    return this.standingRepository
      .createQueryBuilder("standing")
      .orderBy("standing.group", "ASC")
      .addOrderBy("standing.points", "DESC")
      .addOrderBy("standing.gamesWon", "DESC")
      .addOrderBy("standing.goals_for - standing.goals_against", "DESC")
      .addOrderBy("standing.goalsFor", "DESC")
      .getMany();
  }
}
