import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/database";
import { Group } from "../entities/Group";
import { Team } from "../entities/Team";
import { User } from "../entities/User";

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

describe("Teams Endpoints", () => {
  let group: Group;
  let team: Team;

  beforeEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);

    // Clean up
    await teamRepo.delete({ id: 8899 });
    await teamRepo.delete({ id: 8898 });
    await teamRepo.delete({ id: 8897 });
    await groupRepo.delete({ name: "Test Group Teams" });

    // Create Group
    group = new Group();
    group.name = "Test Group Teams";
    await groupRepo.save(group);

    // Create Teams
    team = new Team();
    team.id = 8899;
    team.name = "Test Team A";
    team.founded = 2026;
    team.mainStadium = "Stadium A";
    team.mainStadiumCity = "City A";
    team.group = group;
    await teamRepo.save(team);

    const team2 = new Team();
    team2.id = 8898;
    team2.name = "Test Team B";
    team2.founded = 2020;
    team2.mainStadium = "Stadium B";
    team2.mainStadiumCity = "City B";
    team2.group = group;
    await teamRepo.save(team2);

    const team3 = new Team();
    team3.id = 8897;
    team3.name = "Test Team C";
    team3.founded = 2024;
    team3.mainStadium = "Stadium C";
    team3.mainStadiumCity = "City C";
    team3.group = group;
    await teamRepo.save(team3);
  });

  afterEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);

    await teamRepo.delete({ id: 8899 });
    await teamRepo.delete({ id: 8898 });
    await teamRepo.delete({ id: 8897 });
    if (group?.id) {
      await groupRepo.delete({ id: group.id });
    }
  });

  describe("GET /teams", () => {
    it("should return all teams along with their group information", async () => {
      const res = await request(app).get("/api/teams");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const foundTeam = res.body.find((t: any) => t.id === 8899);
      expect(foundTeam).toBeDefined();
      expect(foundTeam.name).toBe("Test Team A");
      expect(foundTeam.group).toBeDefined();
      expect(foundTeam.group.name).toBe("Test Group Teams");
    });

    it("should filter teams by name (partial match)", async () => {
      const res = await request(app).get("/api/teams?name=Team A");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.id === 8899)).toBe(true);
    });

    it("should filter teams by name case-insensitively", async () => {
      const res = await request(app).get("/api/teams?name=team a");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.id === 8899)).toBe(true);
    });

    it("should return empty array if no team matches name filter", async () => {
      const res = await request(app).get("/api/teams?name=NonExistentTeamName123");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it("should sort teams by founded column in ascending order", async () => {
      const res = await request(app).get("/api/teams?orderBy=founded&orderDir=asc");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const targetTeams = res.body.filter((t: any) => [8897, 8898, 8899].includes(t.id));
      expect(targetTeams).toHaveLength(3);
      // Expected order: 2020 (8898), 2024 (8897), 2026 (8899)
      expect(targetTeams[0].id).toBe(8898);
      expect(targetTeams[1].id).toBe(8897);
      expect(targetTeams[2].id).toBe(8899);
    });

    it("should sort teams by founded column in descending order", async () => {
      const res = await request(app).get("/api/teams?orderBy=founded&orderDir=DESC");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const targetTeams = res.body.filter((t: any) => [8897, 8898, 8899].includes(t.id));
      expect(targetTeams).toHaveLength(3);
      // Expected order: 2026 (8899), 2024 (8897), 2020 (8898)
      expect(targetTeams[0].id).toBe(8899);
      expect(targetTeams[1].id).toBe(8897);
      expect(targetTeams[2].id).toBe(8898);
    });

    it("should return 400 Bad Request when an invalid orderBy column is provided", async () => {
      const res = await request(app).get("/api/teams?orderBy=invalidColumnName");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "ValidationError");
    });

    it("should return 400 Bad Request when an invalid orderDir is provided", async () => {
      const res = await request(app).get("/api/teams?orderBy=name&orderDir=invalidDir");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "ValidationError");
    });

    it("should return 400 Bad Request when an invalid query parameter is provided", async () => {
      const res = await request(app).get("/api/teams?invalidParam=something");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "ValidationError");
    });
  });

  describe("Favorite Teams Endpoints", () => {
    const testEmail = "fav-test@example.com";
    const testPassword = "securePassword123";
    let accessTokenCookie: string;

    beforeEach(async () => {
      const userRepo = AppDataSource.getRepository(User);
      await userRepo.delete({ email: testEmail });

      // Register and login
      await request(app)
        .post("/api/auth/register")
        .send({ email: testEmail, username: "favtestuser", password: testPassword });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword });

      const cookies = loginRes.headers["set-cookie"] as string[] | undefined;
      accessTokenCookie = cookies!.find((c) => c.startsWith("accessToken="))!;
    });

    afterEach(async () => {
      const userRepo = AppDataSource.getRepository(User);
      await userRepo.delete({ email: testEmail });
    });

    describe("POST /teams/favorites", () => {
      it("should successfully add a favorite team (201)", async () => {
        const res = await request(app)
          .post("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 8899 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("message", "Team added to favorites successfully");

        // Verify it was added
        const getRes = await request(app)
          .get("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie]);

        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(1);
        expect(getRes.body[0].id).toBe(8899);
        expect(getRes.body[0].name).toBe("Test Team A");
      });

      it("should return 400 Bad Request when teamId is invalid", async () => {
        const res = await request(app)
          .post("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: "invalid-id" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "ValidationError");
      });

      it("should return 401 Unauthorized when token is missing", async () => {
        const res = await request(app)
          .post("/api/teams/favorites")
          .send({ teamId: 8899 });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "UnauthorizedError");
      });

      it("should return 404 Not Found when team does not exist", async () => {
        const res = await request(app)
          .post("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 99999 });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "NotFoundError");
      });
    });

    describe("GET /teams/favorites", () => {
      it("should return 401 Unauthorized when token is missing", async () => {
        const res = await request(app).get("/api/teams/favorites");

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "UnauthorizedError");
      });

      it("should return empty list when user has no favorites", async () => {
        const res = await request(app)
          .get("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie]);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
      });
    });

    describe("DELETE /teams/favorites", () => {
      it("should successfully remove a favorite team (200)", async () => {
        // Add first
        await request(app)
          .post("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 8899 });

        // Delete
        const res = await request(app)
          .delete("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 8899 });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Team removed from favorites successfully");

        // Verify it was removed
        const getRes = await request(app)
          .get("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie]);

        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(0);
      });

      it("should return 400 Bad Request when teamId is invalid", async () => {
        const res = await request(app)
          .delete("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: "invalid-id" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "ValidationError");
      });

      it("should return 401 Unauthorized when token is missing", async () => {
        const res = await request(app)
          .delete("/api/teams/favorites")
          .send({ teamId: 8899 });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "UnauthorizedError");
      });

      it("should return 404 Not Found when team does not exist", async () => {
        const res = await request(app)
          .delete("/api/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 99999 });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "NotFoundError");
      });
    });
  });
});
