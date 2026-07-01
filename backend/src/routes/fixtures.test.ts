import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/database";
import { Group } from "../entities/Group";
import { Team } from "../entities/Team";
import { Fixture } from "../entities/Fixture";
import { Event } from "../entities/Event";

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("Fixtures Endpoints", () => {
  let groupA: Group;
  let groupB: Group;
  let teamA: Team;
  let teamB: Team;
  let teamC: Team;
  let fixture1: Fixture;
  let fixture2: Fixture;
  let event1: Event;

  beforeEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);
    const fixtureRepo = AppDataSource.getRepository(Fixture);
    const eventRepo = AppDataSource.getRepository(Event);

    // Clean up test data
    await eventRepo.delete({ playerName: "Test Player 1" });
    await fixtureRepo.delete({ id: 9901 });
    await fixtureRepo.delete({ id: 9902 });
    await teamRepo.delete({ id: 8891 });
    await teamRepo.delete({ id: 8892 });
    await teamRepo.delete({ id: 8893 });
    await groupRepo.delete({ name: "Test Group A" });
    await groupRepo.delete({ name: "Test Group B" });

    // Seed Groups
    groupA = new Group();
    groupA.name = "Test Group A";
    await groupRepo.save(groupA);

    groupB = new Group();
    groupB.name = "Test Group B";
    await groupRepo.save(groupB);

    // Seed Teams
    teamA = new Team();
    teamA.id = 8891;
    teamA.name = "Test Team A";
    teamA.founded = 1900;
    teamA.mainStadium = "Stadium A";
    teamA.mainStadiumCity = "City A";
    teamA.group = groupA;
    await teamRepo.save(teamA);

    teamB = new Team();
    teamB.id = 8892;
    teamB.name = "Test Team B";
    teamB.founded = 1910;
    teamB.mainStadium = "Stadium B";
    teamB.mainStadiumCity = "City B";
    teamB.group = groupA;
    await teamRepo.save(teamB);

    teamC = new Team();
    teamC.id = 8893;
    teamC.name = "Test Team C";
    teamC.founded = 1920;
    teamC.mainStadium = "Stadium C";
    teamC.mainStadiumCity = "City C";
    teamC.group = groupB;
    await teamRepo.save(teamC);

    // Seed Fixtures
    fixture1 = new Fixture();
    fixture1.id = 9901;
    fixture1.referee = "Ref 1";
    fixture1.stadium = "Stadium A";
    fixture1.stadiumCity = "City A";
    fixture1.homeTeamId = teamA.id;
    fixture1.homeTeamName = teamA.name;
    fixture1.awayTeamId = teamB.id;
    fixture1.awayTeamName = teamB.name;
    fixture1.round = "Group Stage - 1";
    fixture1.homeTeam = teamA;
    fixture1.awayTeam = teamB;
    await fixtureRepo.save(fixture1);

    fixture2 = new Fixture();
    fixture2.id = 9902;
    fixture2.referee = "Ref 2";
    fixture2.stadium = "Stadium B";
    fixture2.stadiumCity = "City B";
    fixture2.homeTeamId = teamA.id;
    fixture2.homeTeamName = teamA.name;
    fixture2.awayTeamId = teamC.id;
    fixture2.awayTeamName = teamC.name;
    fixture2.round = "Round of 16";
    fixture2.homeTeam = teamA;
    fixture2.awayTeam = teamC;
    await fixtureRepo.save(fixture2);

    // Seed Event
    event1 = new Event();
    event1.fixtureId = fixture1.id;
    event1.type = "Goal";
    event1.minute = 10;
    event1.playerName = "Test Player 1";
    event1.teamId = teamA.id;
    event1.teamName = teamA.name;
    event1.fixture = fixture1;
    await eventRepo.save(event1);
  });

  afterEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);
    const fixtureRepo = AppDataSource.getRepository(Fixture);
    const eventRepo = AppDataSource.getRepository(Event);

    await eventRepo.delete({ playerName: "Test Player 1" });
    await fixtureRepo.delete({ id: 9901 });
    await fixtureRepo.delete({ id: 9902 });
    await teamRepo.delete({ id: 8891 });
    await teamRepo.delete({ id: 8892 });
    await teamRepo.delete({ id: 8893 });
    if (groupA?.id) await groupRepo.delete({ id: groupA.id });
    if (groupB?.id) await groupRepo.delete({ id: groupB.id });
  });

  describe("GET /fixtures", () => {
    it("should return all fixtures with their events included, accessible unauthenticated", async () => {
      const res = await request(app).get("/fixtures");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const f1 = res.body.find((f: any) => f.id === fixture1.id);
      expect(f1).toBeDefined();
      expect(f1.events).toBeDefined();
      expect(f1.events.length).toBe(1);
      expect(f1.events[0].playerName).toBe("Test Player 1");

      // Verify that team objects are filtered to only id, name, and group
      expect(f1.homeTeam).toBeDefined();
      expect(Object.keys(f1.homeTeam).sort()).toEqual(["group", "id", "name"]);
      expect(f1.homeTeam.group).toBeDefined();
      expect(Object.keys(f1.homeTeam.group).sort()).toEqual(["id", "name"]);
      expect(f1.homeTeam.founded).toBeUndefined();
      expect(f1.homeTeam.mainStadium).toBeUndefined();

      expect(f1.awayTeam).toBeDefined();
      expect(Object.keys(f1.awayTeam).sort()).toEqual(["group", "id", "name"]);
      expect(f1.awayTeam.group).toBeDefined();
      expect(Object.keys(f1.awayTeam.group).sort()).toEqual(["id", "name"]);

      const f2 = res.body.find((f: any) => f.id === fixture2.id);
      expect(f2).toBeDefined();
      expect(f2.events).toEqual([]);
    });

    it("should filter fixtures by round", async () => {
      const res = await request(app)
        .get("/fixtures")
        .query({ round: "Round of 16" });

      expect(res.status).toBe(200);
      const matches = res.body.filter((f: any) => [fixture1.id, fixture2.id].includes(f.id));
      expect(matches.length).toBe(1);
      expect(matches[0].id).toBe(fixture2.id);
    });

    it("should filter fixtures by group name", async () => {
      const res = await request(app)
        .get("/fixtures")
        .query({ group: "Test Group A" });

      expect(res.status).toBe(200);
      const matches = res.body.filter((f: any) => [fixture1.id, fixture2.id].includes(f.id));
      // fixture1 home/away are in Test Group A.
      // fixture2 away is Test Team C which is in Test Group B.
      // homeTeam is in Test Group A, so both match because of OR condition.
      // Let's verify.
      expect(matches.map((f: any) => f.id)).toContain(fixture1.id);
      expect(matches.map((f: any) => f.id)).toContain(fixture2.id);

      const resB = await request(app)
        .get("/fixtures")
        .query({ group: "Test Group B" });

      expect(resB.status).toBe(200);
      const matchesB = resB.body.filter((f: any) => [fixture1.id, fixture2.id].includes(f.id));
      // Only fixture2 contains Team C (Test Group B)
      expect(matchesB.length).toBe(1);
      expect(matchesB[0].id).toBe(fixture2.id);
    });

    it("should filter fixtures by teamId", async () => {
      const res = await request(app)
        .get("/fixtures")
        .query({ teamId: 8892 }); // Team B

      expect(res.status).toBe(200);
      const matches = res.body.filter((f: any) => [fixture1.id, fixture2.id].includes(f.id));
      expect(matches.length).toBe(1);
      expect(matches[0].id).toBe(fixture1.id);
    });

    it("should return 400 Bad Request when an invalid query parameter is provided", async () => {
      const res = await request(app)
        .get("/fixtures")
        .query({ teamId: "not-a-number" });

      expect(res.status).toBe(400);
    });
  });
});
