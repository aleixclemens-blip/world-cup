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
  let teamD: Team;
  let fixture1: Fixture;
  let fixture2: Fixture;
  let fixture3: Fixture;
  let fixture4: Fixture;
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
    await fixtureRepo.delete({ id: 9903 });
    await fixtureRepo.delete({ id: 9904 });
    await teamRepo.delete({ id: 8891 });
    await teamRepo.delete({ id: 8892 });
    await teamRepo.delete({ id: 8893 });
    await teamRepo.delete({ id: 8894 });
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

    teamD = new Team();
    teamD.id = 8894;
    teamD.name = "Test Team D";
    teamD.founded = 1920;
    teamD.mainStadium = "Stadium D";
    teamD.mainStadiumCity = "City D";
    teamD.group = groupB;
    await teamRepo.save(teamD);

    // Seed Fixtures
    // fixture1: Group Stage - 2, Group A
    fixture1 = new Fixture();
    fixture1.id = 9901;
    fixture1.referee = "Ref 1";
    fixture1.stadium = "Stadium A";
    fixture1.stadiumCity = "City A";
    fixture1.homeTeamId = teamA.id;
    fixture1.homeTeamName = teamA.name;
    fixture1.awayTeamId = teamB.id;
    fixture1.awayTeamName = teamB.name;
    fixture1.round = "Group Stage - 2";
    fixture1.homeTeam = teamA;
    fixture1.awayTeam = teamB;
    await fixtureRepo.save(fixture1);

    // fixture2: Round of 16
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

    // fixture3: Group Stage - 1, Group B
    fixture3 = new Fixture();
    fixture3.id = 9903;
    fixture3.referee = "Ref 3";
    fixture3.stadium = "Stadium C";
    fixture3.stadiumCity = "City C";
    fixture3.homeTeamId = teamC.id;
    fixture3.homeTeamName = teamC.name;
    fixture3.awayTeamId = teamD.id;
    fixture3.awayTeamName = teamD.name;
    fixture3.round = "Group Stage - 1";
    fixture3.homeTeam = teamC;
    fixture3.awayTeam = teamD;
    await fixtureRepo.save(fixture3);

    // fixture4: Group Stage - 1, Group A
    fixture4 = new Fixture();
    fixture4.id = 9904;
    fixture4.referee = "Ref 4";
    fixture4.stadium = "Stadium A";
    fixture4.stadiumCity = "City A";
    fixture4.homeTeamId = teamA.id;
    fixture4.homeTeamName = teamA.name;
    fixture4.awayTeamId = teamB.id;
    fixture4.awayTeamName = teamB.name;
    fixture4.round = "Group Stage - 1";
    fixture4.homeTeam = teamA;
    fixture4.awayTeam = teamB;
    await fixtureRepo.save(fixture4);

    // Seed Event
    event1 = new Event();
    event1.fixtureId = fixture4.id;
    event1.type = "Goal";
    event1.minute = 10;
    event1.playerName = "Test Player 1";
    event1.teamId = teamA.id;
    event1.teamName = teamA.name;
    event1.fixture = fixture4;
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
    await fixtureRepo.delete({ id: 9903 });
    await fixtureRepo.delete({ id: 9904 });
    await teamRepo.delete({ id: 8891 });
    await teamRepo.delete({ id: 8892 });
    await teamRepo.delete({ id: 8893 });
    await teamRepo.delete({ id: 8894 });
    if (groupA?.id) await groupRepo.delete({ id: groupA.id });
    if (groupB?.id) await groupRepo.delete({ id: groupB.id });
  });

  describe("GET /fixtures", () => {
    it("should return all fixtures with their events included and sorted by group first, then round chronologically", async () => {
      const res = await request(app).get("/api/fixtures");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verify correct sorting order:
      // 1. fixture4 (9904): Test Group A, Stage 1
      // 2. fixture1 (9901): Test Group A, Stage 2
      // 3. fixture3 (9903): Test Group B, Stage 1
      // 4. fixture2 (9902): Round of 16 (knockout)
      const indices = res.body
        .filter((f: any) => [9901, 9902, 9903, 9904].includes(f.id))
        .map((f: any) => f.id);
      expect(indices).toEqual([9904, 9901, 9903, 9902]);

      const f4 = res.body.find((f: any) => f.id === fixture4.id);
      expect(f4).toBeDefined();
      expect(f4.events).toBeDefined();
      expect(f4.events.length).toBe(1);
      expect(f4.events[0].playerName).toBe("Test Player 1");

      // Verify that team objects are filtered to only id, name, and group
      expect(f4.homeTeam).toBeDefined();
      expect(Object.keys(f4.homeTeam).sort()).toEqual(["group", "id", "name"]);
      expect(f4.homeTeam.group).toBeDefined();
      expect(Object.keys(f4.homeTeam.group).sort()).toEqual(["id", "name"]);
      expect(f4.homeTeam.founded).toBeUndefined();
      expect(f4.homeTeam.mainStadium).toBeUndefined();

      expect(f4.awayTeam).toBeDefined();
      expect(Object.keys(f4.awayTeam).sort()).toEqual(["group", "id", "name"]);
      expect(f4.awayTeam.group).toBeDefined();
      expect(Object.keys(f4.awayTeam.group).sort()).toEqual(["id", "name"]);
    });

    it("should filter fixtures by round", async () => {
      const res = await request(app)
        .get("/api/fixtures")
        .query({ round: "Round of 16" });

      expect(res.status).toBe(200);
      const matches = res.body.filter((f: any) =>
        [fixture1.id, fixture2.id, fixture3.id, fixture4.id].includes(f.id),
      );
      expect(matches.length).toBe(1);
      expect(matches[0].id).toBe(fixture2.id);
    });

    it("should filter fixtures by group name and only return group stage matches", async () => {
      const res = await request(app)
        .get("/api/fixtures")
        .query({ group: "Test Group A" });

      expect(res.status).toBe(200);
      const matches = res.body.filter((f: any) =>
        [fixture1.id, fixture2.id, fixture3.id, fixture4.id].includes(f.id),
      );
      // Only fixture1, fixture4 are group stage matches for Group A
      // fixture2 is excluded because it's a Round of 16 match
      expect(matches.map((f: any) => f.id).sort()).toEqual(
        [fixture1.id, fixture4.id].sort(),
      );

      const resB = await request(app)
        .get("/api/fixtures")
        .query({ group: "Test Group B" });

      expect(resB.status).toBe(200);
      const matchesB = resB.body.filter((f: any) =>
        [fixture1.id, fixture2.id, fixture3.id, fixture4.id].includes(f.id),
      );
      // Only fixture3 is a group stage match for Group B
      // fixture2 is excluded because it's a Round of 16 match
      expect(matchesB.map((f: any) => f.id).sort()).toEqual(
        [fixture3.id].sort(),
      );
    });

    it("should filter fixtures by teamId", async () => {
      const res = await request(app)
        .get("/api/fixtures")
        .query({ teamId: 8892 }); // Team B

      expect(res.status).toBe(200);
      const matches = res.body.filter((f: any) =>
        [fixture1.id, fixture2.id, fixture3.id, fixture4.id].includes(f.id),
      );
      // Team B plays in fixture1 and fixture4
      expect(matches.map((f: any) => f.id).sort()).toEqual(
        [fixture1.id, fixture4.id].sort(),
      );
    });

    it("should return 400 Bad Request when an invalid query parameter is provided", async () => {
      const res = await request(app)
        .get("/api/fixtures")
        .query({ teamId: "not-a-number" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /fixtures/:id", () => {
    it("should return a single fixture with events, teams and groups by ID", async () => {
      const res = await request(app).get(`/api/fixtures/${fixture4.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(fixture4.id);
      expect(res.body.events).toBeDefined();
      expect(res.body.events.length).toBe(1);
      expect(res.body.events[0].playerName).toBe("Test Player 1");

      // Verify that team objects are filtered to only id, name, and group
      expect(res.body.homeTeam).toBeDefined();
      expect(Object.keys(res.body.homeTeam).sort()).toEqual(["group", "id", "name"]);
      expect(res.body.homeTeam.group).toBeDefined();
      expect(Object.keys(res.body.homeTeam.group).sort()).toEqual(["id", "name"]);

      expect(res.body.awayTeam).toBeDefined();
      expect(Object.keys(res.body.awayTeam).sort()).toEqual(["group", "id", "name"]);
      expect(res.body.awayTeam.group).toBeDefined();
      expect(Object.keys(res.body.awayTeam.group).sort()).toEqual(["id", "name"]);
    });

    it("should return 404 Not Found if fixture does not exist", async () => {
      const res = await request(app).get("/api/fixtures/9999");
      expect(res.status).toBe(404);
    });

    it("should return 400 Bad Request when the ID is invalid", async () => {
      const res = await request(app).get("/api/fixtures/not-an-id");
      expect(res.status).toBe(400);
    });
  });
});

