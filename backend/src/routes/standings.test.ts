import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/database";
import { Group } from "../entities/Group";
import { Team } from "../entities/Team";
import { Standing } from "../entities/Standing";

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

describe("Standings Endpoints", () => {
  let group: Group;
  let team1: Team;
  let team2: Team;

  beforeEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);
    const standingRepo = AppDataSource.getRepository(Standing);

    // Clean up
    await standingRepo.delete({ teamId: 8881 });
    await standingRepo.delete({ teamId: 8882 });
    await teamRepo.delete({ id: 8881 });
    await teamRepo.delete({ id: 8882 });
    await groupRepo.delete({ name: "Test Group Standings" });

    // Create Group
    group = new Group();
    group.name = "Test Group Standings";
    await groupRepo.save(group);

    // Create Team 1
    team1 = new Team();
    team1.id = 8881;
    team1.name = "Test Team A";
    team1.founded = 2026;
    team1.mainStadium = "Stadium A";
    team1.mainStadiumCity = "City A";
    team1.group = group;
    await teamRepo.save(team1);

    // Create Team 2
    team2 = new Team();
    team2.id = 8882;
    team2.name = "Test Team B";
    team2.founded = 2026;
    team2.mainStadium = "Stadium B";
    team2.mainStadiumCity = "City B";
    team2.group = group;
    await teamRepo.save(team2);
  });

  afterEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);
    const standingRepo = AppDataSource.getRepository(Standing);

    await standingRepo.delete({ teamId: 8881 });
    await standingRepo.delete({ teamId: 8882 });
    await teamRepo.delete({ id: 8881 });
    await teamRepo.delete({ id: 8882 });
    if (group?.id) {
      await groupRepo.delete({ id: group.id });
    }
  });

  describe("GET /standings", () => {
    it("should return standings ordered by points desc", async () => {
      const standingRepo = AppDataSource.getRepository(Standing);

      // Standing 1 (team 1) - lower points
      const st1 = new Standing();
      st1.group = "Group X";
      st1.teamId = team1.id;
      st1.teamName = team1.name;
      st1.points = 3;
      st1.gamesWon = 1;
      st1.gamesDraw = 0;
      st1.gamesLost = 2;
      st1.goalsFor = 2;
      st1.goalsAgainst = 4;
      await standingRepo.save(st1);

      // Standing 2 (team 2) - higher points
      const st2 = new Standing();
      st2.group = "Group X";
      st2.teamId = team2.id;
      st2.teamName = team2.name;
      st2.points = 6;
      st2.gamesWon = 2;
      st2.gamesDraw = 0;
      st2.gamesLost = 1;
      st2.goalsFor = 5;
      st2.goalsAgainst = 2;
      await standingRepo.save(st2);

      const res = await request(app).get("/standings");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const filtered = res.body.filter((s: any) => s.group === "Group X");
      expect(filtered.length).toBe(2);
      expect(filtered[0].teamId).toBe(team2.id); // higher points first
      expect(filtered[1].teamId).toBe(team1.id);
    });

    it("should return standings ordered by goal difference then goalsFor when points are equal", async () => {
      const standingRepo = AppDataSource.getRepository(Standing);

      // Standing 1 (team 1) - points = 3, gamesWon = 1, goalsFor = 4, goalsAgainst = 2 (diff = +2)
      const st1 = new Standing();
      st1.group = "Group Y";
      st1.teamId = team1.id;
      st1.teamName = team1.name;
      st1.points = 3;
      st1.gamesWon = 1;
      st1.gamesDraw = 0;
      st1.gamesLost = 2;
      st1.goalsFor = 4;
      st1.goalsAgainst = 2;
      await standingRepo.save(st1);

      // Standing 2 (team 2) - points = 3, gamesWon = 1, goalsFor = 2, goalsAgainst = 3 (diff = -1)
      const st2 = new Standing();
      st2.group = "Group Y";
      st2.teamId = team2.id;
      st2.teamName = team2.name;
      st2.points = 3;
      st2.gamesWon = 1;
      st2.gamesDraw = 0;
      st2.gamesLost = 2;
      st2.goalsFor = 2;
      st2.goalsAgainst = 3;
      await standingRepo.save(st2);

      const res = await request(app).get("/standings");

      expect(res.status).toBe(200);
      const filtered = res.body.filter((s: any) => s.group === "Group Y");
      expect(filtered.length).toBe(2);
      expect(filtered[0].teamId).toBe(team1.id); // +2 diff first
      expect(filtered[1].teamId).toBe(team2.id); // -1 diff second
    });

    it("should return standings ordered by goalsFor when points and goal difference are equal", async () => {
      const standingRepo = AppDataSource.getRepository(Standing);

      // Standing 1 (team 1) - points = 3, gamesWon = 1, goalsFor = 3, goalsAgainst = 1 (diff = +2)
      const st1 = new Standing();
      st1.group = "Group Z";
      st1.teamId = team1.id;
      st1.teamName = team1.name;
      st1.points = 3;
      st1.gamesWon = 1;
      st1.gamesDraw = 0;
      st1.gamesLost = 2;
      st1.goalsFor = 3;
      st1.goalsAgainst = 1;
      await standingRepo.save(st1);

      // Standing 2 (team 2) - points = 3, gamesWon = 1, goalsFor = 4, goalsAgainst = 2 (diff = +2)
      const st2 = new Standing();
      st2.group = "Group Z";
      st2.teamId = team2.id;
      st2.teamName = team2.name;
      st2.points = 3;
      st2.gamesWon = 1;
      st2.gamesDraw = 0;
      st2.gamesLost = 2;
      st2.goalsFor = 4;
      st2.goalsAgainst = 2;
      await standingRepo.save(st2);

      const res = await request(app).get("/standings");

      expect(res.status).toBe(200);
      const filtered = res.body.filter((s: any) => s.group === "Group Z");
      expect(filtered.length).toBe(2);
      expect(filtered[0].teamId).toBe(team2.id); // 4 goalsFor first
      expect(filtered[1].teamId).toBe(team1.id); // 3 goalsFor second
    });
  });
});
