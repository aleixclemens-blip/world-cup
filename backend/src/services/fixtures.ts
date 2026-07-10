import { Repository } from "typeorm";
import { Fixture } from "../entities/Fixture";

export class FixturesService {
  constructor(private fixtureRepository: Repository<Fixture>) { }

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
        "fixture.round LIKE 'Group Stage%' AND (homeGroup.name = :group OR awayGroup.name = :group)",
        { group: filters.group },
      );
    }

    if (filters.teamId) {
      query.andWhere(
        "(fixture.homeTeamId = :teamId OR fixture.awayTeamId = :teamId)",
        { teamId: filters.teamId },
      );
    }

    query.orderBy(
      "CASE WHEN fixture.round LIKE 'Group Stage%' THEN 0 ELSE 1 END",
      "ASC",
    );
    query.addOrderBy(
      "CASE WHEN fixture.round LIKE 'Group Stage%' THEN homeGroup.name ELSE NULL END",
      "ASC",
    );
    query.addOrderBy(
      `CASE fixture.round
        WHEN 'Group Stage - 1' THEN 1
        WHEN 'Group Stage - 2' THEN 2
        WHEN 'Group Stage - 3' THEN 3
        WHEN 'Round of 16' THEN 4
        WHEN 'Quarter-finals' THEN 5
        WHEN 'Semi-finals' THEN 6
        WHEN '3rd Place Final' THEN 7
        WHEN 'Final' THEN 8
        ELSE 9
      END`,
      "ASC",
    );
    query.addOrderBy("fixture.id", "ASC");

    return query.getMany();
  }

  async getFixtureById(id: number): Promise<Fixture | null> {
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
      ])
      .where("fixture.id = :id", { id });

    return query.getOne();
  }
}

