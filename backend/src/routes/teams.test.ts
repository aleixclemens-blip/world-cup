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
    await groupRepo.delete({ name: "Test Group Teams" });

    // Create Group
    group = new Group();
    group.name = "Test Group Teams";
    await groupRepo.save(group);

    // Create Team
    team = new Team();
    team.id = 8899;
    team.name = "Test Team A";
    team.founded = 2026;
    team.mainStadium = "Stadium A";
    team.mainStadiumCity = "City A";
    team.group = group;
    await teamRepo.save(team);
  });

  afterEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);

    await teamRepo.delete({ id: 8899 });
    if (group?.id) {
      await groupRepo.delete({ id: group.id });
    }
  });

  describe("GET /teams", () => {
    it("should return all teams along with their group information", async () => {
      const res = await request(app).get("/teams");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const foundTeam = res.body.find((t: any) => t.id === 8899);
      expect(foundTeam).toBeDefined();
      expect(foundTeam.name).toBe("Test Team A");
      expect(foundTeam.group).toBeDefined();
      expect(foundTeam.group.name).toBe("Test Group Teams");
    });

    it("should filter teams by name (partial match)", async () => {
      const res = await request(app).get("/teams?name=Team A");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.id === 8899)).toBe(true);
    });

    it("should filter teams by name case-insensitively", async () => {
      const res = await request(app).get("/teams?name=team a");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.id === 8899)).toBe(true);
    });

    it("should return empty array if no team matches name filter", async () => {
      const res = await request(app).get("/teams?name=NonExistentTeamName123");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it("should return 400 Bad Request when an invalid query parameter is provided", async () => {
      const res = await request(app).get("/teams?invalidParam=something");

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
        .post("/auth/register")
        .send({ email: testEmail, username: "favtestuser", password: testPassword });

      const loginRes = await request(app)
        .post("/auth/login")
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
          .post("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 8899 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("message", "Team added to favorites successfully");

        // Verify it was added
        const getRes = await request(app)
          .get("/teams/favorites")
          .set("Cookie", [accessTokenCookie]);

        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(1);
        expect(getRes.body[0].id).toBe(8899);
        expect(getRes.body[0].name).toBe("Test Team A");
      });

      it("should return 400 Bad Request when teamId is invalid", async () => {
        const res = await request(app)
          .post("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: "invalid-id" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "ValidationError");
      });

      it("should return 401 Unauthorized when token is missing", async () => {
        const res = await request(app)
          .post("/teams/favorites")
          .send({ teamId: 8899 });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "UnauthorizedError");
      });

      it("should return 404 Not Found when team does not exist", async () => {
        const res = await request(app)
          .post("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 99999 });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "NotFoundError");
      });
    });

    describe("GET /teams/favorites", () => {
      it("should return 401 Unauthorized when token is missing", async () => {
        const res = await request(app).get("/teams/favorites");

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "UnauthorizedError");
      });

      it("should return empty list when user has no favorites", async () => {
        const res = await request(app)
          .get("/teams/favorites")
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
          .post("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 8899 });

        // Delete
        const res = await request(app)
          .delete("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 8899 });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Team removed from favorites successfully");

        // Verify it was removed
        const getRes = await request(app)
          .get("/teams/favorites")
          .set("Cookie", [accessTokenCookie]);

        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(0);
      });

      it("should return 400 Bad Request when teamId is invalid", async () => {
        const res = await request(app)
          .delete("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: "invalid-id" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "ValidationError");
      });

      it("should return 401 Unauthorized when token is missing", async () => {
        const res = await request(app)
          .delete("/teams/favorites")
          .send({ teamId: 8899 });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "UnauthorizedError");
      });

      it("should return 404 Not Found when team does not exist", async () => {
        const res = await request(app)
          .delete("/teams/favorites")
          .set("Cookie", [accessTokenCookie])
          .send({ teamId: 99999 });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "NotFoundError");
      });
    });
  });
});
