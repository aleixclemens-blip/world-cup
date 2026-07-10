import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { AppDataSource } from "../config/database";
import { Group } from "../entities/Group";
import { Team } from "../entities/Team";
import { Standing } from "../entities/Standing";
import { Fixture } from "../entities/Fixture";
import { Event } from "../entities/Event";

const DATA_DIR = path.join(__dirname, "../../data");

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
  league: {
    round: string;
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

interface EventJsonItem {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

interface EventJson {
  response: Array<EventJsonItem>;
}

interface FixtureJson {
  response: Array<FixtureJsonItem>;
}

async function cleanDatabase(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");
  await queryRunner.query("TRUNCATE TABLE `EVENTS`");
  await queryRunner.query("TRUNCATE TABLE `FIXTURES`");
  await queryRunner.query("TRUNCATE TABLE `STANDINGS`");
  await queryRunner.query("TRUNCATE TABLE `TEAMS`");
  await queryRunner.query("TRUNCATE TABLE `GROUPS`");
  await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");
  await queryRunner.release();
}

async function main(): Promise<void> {
  console.log("Initializing database connection...");
  await AppDataSource.initialize();

  try {
    console.log("Cleaning existing tables...");
    await cleanDatabase();

    // 1. Read JSON files
    const standingsPath = path.join(DATA_DIR, "standings.json");
    const teamsPath = path.join(DATA_DIR, "teams.json");
    const fixturesPath = path.join(DATA_DIR, "fixtures.json");

    const standingsData: StandingJson = JSON.parse(
      fs.readFileSync(standingsPath, "utf8"),
    ) as StandingJson;
    const teamsData: TeamJson = JSON.parse(
      fs.readFileSync(teamsPath, "utf8"),
    ) as TeamJson;
    const fixturesData: FixtureJson = JSON.parse(
      fs.readFileSync(fixturesPath, "utf8"),
    ) as FixtureJson;

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

    console.log(
      `Found ${groupNames.size} distinct groups. Populating groups...`,
    );
    const groupRepo = AppDataSource.getRepository(Group);
    const groupNameToEntity = new Map<string, Group>();

    for (const gName of groupNames) {
      const group = new Group();
      group.name = gName;
      const savedGroup = await groupRepo.save(group);
      groupNameToEntity.set(gName, savedGroup);
    }

    const ACHIEVEMENTS: Record<
      number,
      { worldCups: number; continentCups: number; cupName: string }
    > = {
      1: { worldCups: 0, continentCups: 0, cupName: "Eurocup" }, // Belgium
      2: { worldCups: 2, continentCups: 2, cupName: "Eurocup" }, // France
      3: { worldCups: 0, continentCups: 0, cupName: "Eurocup" }, // Croatia
      6: { worldCups: 5, continentCups: 9, cupName: "Copa América" }, // Brazil
      7: { worldCups: 2, continentCups: 15, cupName: "Copa América" }, // Uruguay
      9: { worldCups: 1, continentCups: 4, cupName: "Eurocup" }, // Spain
      10: { worldCups: 1, continentCups: 0, cupName: "Eurocup" }, // England
      12: { worldCups: 0, continentCups: 4, cupName: "AFC Asian Cup" }, // Japan
      13: { worldCups: 0, continentCups: 1, cupName: "Africa Cup of Nations" }, // Senegal
      14: { worldCups: 0, continentCups: 0, cupName: "Eurocup" }, // Serbia
      15: { worldCups: 0, continentCups: 0, cupName: "Eurocup" }, // Switzerland
      16: { worldCups: 0, continentCups: 12, cupName: "CONCACAF Gold Cup" }, // Mexico
      17: { worldCups: 0, continentCups: 2, cupName: "AFC Asian Cup" }, // South Korea
      20: { worldCups: 0, continentCups: 5, cupName: "AFC Asian Cup" }, // Australia
      21: { worldCups: 0, continentCups: 1, cupName: "Eurocup" }, // Denmark
      22: { worldCups: 0, continentCups: 3, cupName: "AFC Asian Cup" }, // Iran
      23: { worldCups: 0, continentCups: 3, cupName: "AFC Asian Cup" }, // Saudi Arabia
      24: { worldCups: 0, continentCups: 0, cupName: "Eurocup" }, // Poland
      25: { worldCups: 4, continentCups: 3, cupName: "Eurocup" }, // Germany
      26: { worldCups: 3, continentCups: 16, cupName: "Copa América" }, // Argentina
      27: { worldCups: 0, continentCups: 1, cupName: "Eurocup" }, // Portugal
      28: { worldCups: 0, continentCups: 1, cupName: "Africa Cup of Nations" }, // Tunisia
      29: { worldCups: 0, continentCups: 3, cupName: "CONCACAF Gold Cup" }, // Costa Rica
      31: { worldCups: 0, continentCups: 1, cupName: "Africa Cup of Nations" }, // Morocco
      767: { worldCups: 0, continentCups: 0, cupName: "Eurocup" }, // Wales
      1118: { worldCups: 0, continentCups: 1, cupName: "Eurocup" }, // Netherlands
      1504: {
        worldCups: 0,
        continentCups: 4,
        cupName: "Africa Cup of Nations",
      }, // Ghana
      1530: {
        worldCups: 0,
        continentCups: 5,
        cupName: "Africa Cup of Nations",
      }, // Cameroon
      1569: { worldCups: 0, continentCups: 2, cupName: "AFC Asian Cup" }, // Qatar
      2382: { worldCups: 0, continentCups: 0, cupName: "Copa América" }, // Ecuador
      2384: { worldCups: 0, continentCups: 7, cupName: "CONCACAF Gold Cup" }, // USA
      5529: { worldCups: 0, continentCups: 2, cupName: "CONCACAF Gold Cup" }, // Canada
    };

    // 3. Populate TEAMS
    console.log(
      `Found ${teamsData.response.length} teams. Populating teams...`,
    );
    const teamRepo = AppDataSource.getRepository(Team);
    const savedTeamsMap = new Map<number, Team>();

    for (const teamEntry of teamsData.response) {
      const t = teamEntry.team;
      const v = teamEntry.venue;
      const team = new Team();
      team.id = t.id;
      team.name = t.name;
      team.founded = t.founded || 0;
      team.mainStadium = v.name || "Unknown Stadium";
      team.mainStadiumCity = v.city || "Unknown City";

      const matchedGroupName = teamIdToGroupName.get(t.id);
      if (matchedGroupName) {
        const groupEntity = groupNameToEntity.get(matchedGroupName);
        if (groupEntity) {
          team.group = groupEntity;
          team.groupId = groupEntity.id;
        }
      }

      const achievement = ACHIEVEMENTS[t.id] || {
        worldCups: 0,
        continentCups: 0,
        cupName: "Unknown Cup",
      };
      team.worldCupsWon = achievement.worldCups;
      team.continentCupsWon = achievement.continentCups;
      team.continentCupName = achievement.cupName;

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
    console.log(
      `Populating fixtures (${fixturesData.response.length} entries)...`,
    );
    const fixtureRepo = AppDataSource.getRepository(Fixture);
    const eventRepo = AppDataSource.getRepository(Event);
    for (const fItem of fixturesData.response) {
      const fix = fItem.fixture;
      const teams = fItem.teams;
      const goals = fItem.goals;
      const penalties = fItem.score.penalty;

      const fixture = new Fixture();
      fixture.id = fix.id;
      fixture.referee = fix.referee || "Unknown Referee";
      fixture.stadium = fix.venue.name || "Unknown Stadium";
      fixture.stadiumCity = fix.venue.city || "Unknown City";
      fixture.homeTeamId = teams.home.id;
      fixture.homeTeamName = teams.home.name;
      fixture.awayTeamId = teams.away.id;
      fixture.awayTeamName = teams.away.name;
      fixture.round = fItem.league.round;
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

      // Seed events for this fixture if they exist
      const fixtureEventsPath = path.join(DATA_DIR, "events", `${fix.id}.json`);
      if (fs.existsSync(fixtureEventsPath)) {
        try {
          const eventsContent = fs.readFileSync(fixtureEventsPath, "utf8");
          const eventsData = JSON.parse(eventsContent) as EventJson;
          if (eventsData.response && Array.isArray(eventsData.response)) {
            for (const eventItem of eventsData.response) {
              if (eventItem.type === "Goal" && eventItem.comments !== "Penalty Shootout") {
                const event = new Event();
                event.fixtureId = fix.id;
                event.type = eventItem.type;
                event.minute = eventItem.time.elapsed;
                event.extraMinute = eventItem.time.extra;
                event.playerName = eventItem.player.name || "Unknown Player";
                event.teamId = eventItem.team.id;
                event.teamName = eventItem.team.name;

                const teamRef = savedTeamsMap.get(eventItem.team.id);
                if (teamRef) {
                  event.team = teamRef;
                }
                event.fixture = fixture;

                await eventRepo.save(event);
              }
            }
          }
        } catch (e) {
          console.warn(`Warning: failed to read/parse events for fixture ${fix.id}:`, e);
        }
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

void main();
