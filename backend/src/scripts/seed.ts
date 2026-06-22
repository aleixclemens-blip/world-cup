import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/database';
import { Group } from '../entities/Group';
import { Team } from '../entities/Team';
import { Standing } from '../entities/Standing';
import { Fixture } from '../entities/Fixture';

const DATA_DIR = path.join(__dirname, '../../.agents/tasks/data');

interface StandingJsonItem {
  team: { id: number; name: string };
  group: string;
  points: number;
  all: {
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface StandingJson {
  response: Array<{
    league: {
      standings: Array<Array<StandingJsonItem>>;
    };
  }>;
}

interface TeamJsonItem {
  team: {
    id: number;
    name: string;
    founded: number;
  };
  venue: {
    name: string;
    city: string;
  };
}

interface TeamJson {
  response: Array<TeamJsonItem>;
}

interface FixtureJsonItem {
  fixture: {
    id: number;
    referee: string | null;
    venue: {
      name: string;
      city: string;
    };
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FixtureJson {
  response: Array<FixtureJsonItem>;
}

async function cleanDatabase(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  await queryRunner.query('TRUNCATE TABLE `FIXTURES`');
  await queryRunner.query('TRUNCATE TABLE `STANDINGS`');
  await queryRunner.query('TRUNCATE TABLE `TEAMS`');
  await queryRunner.query('TRUNCATE TABLE `GROUPS`');
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  await queryRunner.release();
}

async function main(): Promise<void> {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();

  try {
    console.log('Cleaning existing tables...');
    await cleanDatabase();

    // 1. Read JSON files
    const standingsPath = path.join(DATA_DIR, 'standings.json');
    const teamsPath = path.join(DATA_DIR, 'teams.json');
    const fixturesPath = path.join(DATA_DIR, 'fixtures.json');

    const standingsData: StandingJson = JSON.parse(fs.readFileSync(standingsPath, 'utf8')) as StandingJson;
    const teamsData: TeamJson = JSON.parse(fs.readFileSync(teamsPath, 'utf8')) as TeamJson;
    const fixturesData: FixtureJson = JSON.parse(fs.readFileSync(fixturesPath, 'utf8')) as FixtureJson;

    // 2. Map Group names to Standings and extract group names
    const standingsFlat: StandingJsonItem[] = [];
    const groupNames = new Set<string>();
    const teamIdToGroupName = new Map<number, string>();

    const leagues = standingsData.response;
    for (const leagueEntry of leagues) {
      const standingsGroups = leagueEntry.league.standings;
      for (const groupList of standingsGroups) {
        for (const item of groupList) {
          standingsFlat.push(item);
          groupNames.add(item.group);
          teamIdToGroupName.set(item.team.id, item.group);
        }
      }
    }

    console.log(`Found ${groupNames.size} distinct groups. Populating groups...`);
    const groupRepo = AppDataSource.getRepository(Group);
    const groupNameToEntity = new Map<string, Group>();

    for (const gName of groupNames) {
      const group = new Group();
      group.name = gName;
      const savedGroup = await groupRepo.save(group);
      groupNameToEntity.set(gName, savedGroup);
    }

    // 3. Populate TEAMS
    console.log(`Found ${teamsData.response.length} teams. Populating teams...`);
    const teamRepo = AppDataSource.getRepository(Team);
    const savedTeamsMap = new Map<number, Team>();

    for (const teamEntry of teamsData.response) {
      const t = teamEntry.team;
      const v = teamEntry.venue;
      const team = new Team();
      team.id = t.id;
      team.name = t.name;
      team.founded = t.founded || 0;
      team.mainStadium = v.name || 'Unknown Stadium';
      team.mainStadiumCity = v.city || 'Unknown City';

      const matchedGroupName = teamIdToGroupName.get(t.id);
      if (matchedGroupName) {
        const groupEntity = groupNameToEntity.get(matchedGroupName);
        if (groupEntity) {
          team.group = groupEntity;
          team.groupId = groupEntity.id;
        }
      }

      const savedTeam = await teamRepo.save(team);
      savedTeamsMap.set(savedTeam.id, savedTeam);
    }

    // 4. Populate STANDINGS
    console.log(`Populating standings (${standingsFlat.length} entries)...`);
    const standingRepo = AppDataSource.getRepository(Standing);
    for (const sItem of standingsFlat) {
      const standing = new Standing();
      standing.group = sItem.group;
      standing.teamId = sItem.team.id;
      standing.teamName = sItem.team.name;
      standing.gamesWon = sItem.all.win;
      standing.gamesDraw = sItem.all.draw;
      standing.gamesLost = sItem.all.lose;
      standing.goalsFor = sItem.all.goals.for;
      standing.goalsAgainst = sItem.all.goals.against;
      standing.points = sItem.points;

      const teamRef = savedTeamsMap.get(sItem.team.id);
      if (teamRef) {
        standing.team = teamRef;
      }

      await standingRepo.save(standing);
    }

    // 5. Populate FIXTURES
    console.log(`Populating fixtures (${fixturesData.response.length} entries)...`);
    const fixtureRepo = AppDataSource.getRepository(Fixture);
    for (const fItem of fixturesData.response) {
      const fix = fItem.fixture;
      const teams = fItem.teams;
      const goals = fItem.goals;
      const penalties = fItem.score.penalty;

      const fixture = new Fixture();
      fixture.id = fix.id;
      fixture.referee = fix.referee || 'Unknown Referee';
      fixture.stadium = fix.venue.name || 'Unknown Stadium';
      fixture.stadiumCity = fix.venue.city || 'Unknown City';
      fixture.homeTeamId = teams.home.id;
      fixture.homeTeamName = teams.home.name;
      fixture.awayTeamId = teams.away.id;
      fixture.awayTeamName = teams.away.name;
      fixture.goalsHome = goals.home;
      fixture.goalsAway = goals.away;
      fixture.penaltiesHome = penalties.home;
      fixture.penaltiesAway = penalties.away;

      const homeTeamRef = savedTeamsMap.get(teams.home.id);
      if (homeTeamRef) {
        fixture.homeTeam = homeTeamRef;
      }
      const awayTeamRef = savedTeamsMap.get(teams.away.id);
      if (awayTeamRef) {
        fixture.awayTeam = awayTeamRef;
      }

      await fixtureRepo.save(fixture);
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

void main();
