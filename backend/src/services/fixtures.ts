import { Repository } from "typeorm";
import { Fixture } from "../entities/Fixture";

export class FixturesService {
  constructor(private fixtureRepository: Repository<Fixture>) {}

  async getFixtures(filters: {
    round?: string;
    group?: string;
    teamId?: number;
  }): Promise<Fixture[]> {
    const query = this.fixtureRepository
      .createQueryBuilder("fixture")
      .leftJoinAndSelect("fixture.events", "event")
      .leftJoin("fixture.homeTeam", "homeTeam")
      .leftJoin("homeTeam.group", "homeGroup")
      .leftJoin("fixture.awayTeam", "awayTeam")
      .leftJoin("awayTeam.group", "awayGroup")
      .select([
        "fixture",
        "event",
        "homeTeam.id",
        "homeTeam.name",
        "homeGroup.id",
        "homeGroup.name",
        "awayTeam.id",
        "awayTeam.name",
        "awayGroup.id",
        "awayGroup.name",
      ]);

    if (filters.round) {
      query.andWhere("fixture.round = :round", { round: filters.round });
    }

    if (filters.group) {
      query.andWhere(
        "(homeGroup.name = :group OR awayGroup.name = :group)",
        { group: filters.group },
      );
    }

    if (filters.teamId) {
      query.andWhere(
        "(fixture.homeTeamId = :teamId OR fixture.awayTeamId = :teamId)",
        { teamId: filters.teamId },
      );
    }

    query.orderBy("fixture.id", "ASC");

    return query.getMany();
  }
}
