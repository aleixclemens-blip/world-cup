import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/database";
import { Group } from "../entities/Group";
import { Team } from "../entities/Team";
import { Fixture } from "../entities/Fixture";
import { User } from "../entities/User";
import { Comment } from "../entities/Comment";

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

describe("Fixture Comments Endpoints", () => {
  let group: Group;
  let teamHome: Team;
  let teamAway: Team;
  let fixture: Fixture;

  const userEmail1 = "user1@example.com";
  const userEmail2 = "user2@example.com";
  const adminEmail = "admin@example.com";
  const password = "securePassword123";

  let userToken1: string;
  let userToken2: string;
  let adminToken: string;

  let userId1: number;
  let userId2: number;

  beforeEach(async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);
    const fixtureRepo = AppDataSource.getRepository(Fixture);
    const userRepo = AppDataSource.getRepository(User);
    const commentRepo = AppDataSource.getRepository(Comment);

    // Clean up
    await commentRepo.createQueryBuilder().delete().execute();
    await fixtureRepo.delete({ id: 9911 });
    await teamRepo.delete({ id: 8871 });
    await teamRepo.delete({ id: 8872 });
    await groupRepo.delete({ name: "Comments Test Group" });
    await userRepo.delete({ email: userEmail1 });
    await userRepo.delete({ email: userEmail2 });
    await userRepo.delete({ email: adminEmail });

    // Seed group, teams, and fixture
    group = new Group();
    group.name = "Comments Test Group";
    await groupRepo.save(group);

    teamHome = new Team();
    teamHome.id = 8871;
    teamHome.name = "Comments Home Team";
    teamHome.founded = 1905;
    teamHome.mainStadium = "Stadium H";
    teamHome.mainStadiumCity = "City H";
    teamHome.group = group;
    await teamRepo.save(teamHome);

    teamAway = new Team();
    teamAway.id = 8872;
    teamAway.name = "Comments Away Team";
    teamAway.founded = 1906;
    teamAway.mainStadium = "Stadium A";
    teamAway.mainStadiumCity = "City A";
    teamAway.group = group;
    await teamRepo.save(teamAway);

    fixture = new Fixture();
    fixture.id = 9911;
    fixture.referee = "Comments Ref";
    fixture.stadium = "Stadium H";
    fixture.stadiumCity = "City H";
    fixture.homeTeamId = teamHome.id;
    fixture.homeTeamName = teamHome.name;
    fixture.awayTeamId = teamAway.id;
    fixture.awayTeamName = teamAway.name;
    fixture.round = "Group Stage - 1";
    fixture.homeTeam = teamHome;
    fixture.awayTeam = teamAway;
    await fixtureRepo.save(fixture);

    // Register & login User 1
    await request(app)
      .post("/api/auth/register")
      .send({ email: userEmail1, username: "user1", password });
    const loginRes1 = await request(app)
      .post("/api/auth/login")
      .send({ email: userEmail1, password });
    const cookies1 = loginRes1.headers["set-cookie"] as string[];
    userToken1 = cookies1.find((c) => c.startsWith("accessToken="))!;
    userId1 = loginRes1.body.id;

    // Register & login User 2
    await request(app)
      .post("/api/auth/register")
      .send({ email: userEmail2, username: "user2", password });
    const loginRes2 = await request(app)
      .post("/api/auth/login")
      .send({ email: userEmail2, password });
    const cookies2 = loginRes2.headers["set-cookie"] as string[];
    userToken2 = cookies2.find((c) => c.startsWith("accessToken="))!;
    userId2 = loginRes2.body.id;

    // Register, elevate & login Admin
    await request(app)
      .post("/api/auth/register")
      .send({ email: adminEmail, username: "admin", password });
    await userRepo.update({ email: adminEmail }, { role: "admin" });
    const loginResAdmin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });
    const cookiesAdmin = loginResAdmin.headers["set-cookie"] as string[];
    adminToken = cookiesAdmin.find((c) => c.startsWith("accessToken="))!;
  });

  afterEach(async () => {
    const commentRepo = AppDataSource.getRepository(Comment);
    const fixtureRepo = AppDataSource.getRepository(Fixture);
    const teamRepo = AppDataSource.getRepository(Team);
    const groupRepo = AppDataSource.getRepository(Group);
    const userRepo = AppDataSource.getRepository(User);

    await commentRepo.createQueryBuilder().delete().execute();
    await fixtureRepo.delete({ id: 9911 });
    await teamRepo.delete({ id: 8871 });
    await teamRepo.delete({ id: 8872 });
    if (group?.id) await groupRepo.delete({ id: group.id });
    await userRepo.delete({ email: userEmail1 });
    await userRepo.delete({ email: userEmail2 });
    await userRepo.delete({ email: adminEmail });
  });

  describe("POST /fixtures/:fixtureId/comments", () => {
    it("should successfully post a comment when authenticated (201)", async () => {
      const res = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .set("Cookie", [userToken1])
        .send({ content: "What a thrilling match!" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("content", "What a thrilling match!");
      expect(res.body).toHaveProperty("fixtureId", fixture.id);
      expect(res.body).toHaveProperty("userId", userId1);
      expect(res.body).toHaveProperty("createdAt");
      expect(res.body.user).toEqual({
        id: userId1,
        username: "user1",
      });
    });

    it("should return 401 Unauthorized when not authenticated", async () => {
      const res = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .send({ content: "Comment without login" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "UnauthorizedError");
    });

    it("should return 400 Bad Request when content is empty or too long", async () => {
      // Empty content
      const resEmpty = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .set("Cookie", [userToken1])
        .send({ content: "" });
      expect(resEmpty.status).toBe(400);

      // Too long content (> 1000 characters)
      const longContent = "a".repeat(1001);
      const resLong = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .set("Cookie", [userToken1])
        .send({ content: longContent });
      expect(resLong.status).toBe(400);
    });

    it("should return 404 Not Found if the fixture does not exist", async () => {
      const res = await request(app)
        .post("/api/fixtures/999999/comments")
        .set("Cookie", [userToken1])
        .send({ content: "Should fail" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "NotFoundError");
    });
  });

  describe("GET /fixtures/:fixtureId/comments", () => {
    it("should return comments in descendant order (latest first)", async () => {
      // Post comment 1 (older)
      const res1 = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .set("Cookie", [userToken1])
        .send({ content: "First comment" });

      // Small delay to ensure timestamp difference if mysql resolves down to milliseconds/seconds
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Post comment 2 (newer)
      const res2 = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .set("Cookie", [userToken2])
        .send({ content: "Second comment" });

      const getRes = await request(app).get(`/api/fixtures/${fixture.id}/comments`);

      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.length).toBe(2);

      // Descending order: comment 2 (latest) should be first
      expect(getRes.body[0].id).toBe(res2.body.id);
      expect(getRes.body[0].content).toBe("Second comment");
      expect(getRes.body[0].user).toEqual({ id: userId2, username: "user2" });

      expect(getRes.body[1].id).toBe(res1.body.id);
      expect(getRes.body[1].content).toBe("First comment");
      expect(getRes.body[1].user).toEqual({ id: userId1, username: "user1" });
    });

    it("should return 404 Not Found if the fixture does not exist", async () => {
      const res = await request(app).get("/api/fixtures/999999/comments");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "NotFoundError");
    });
  });

  describe("DELETE /fixtures/:fixtureId/comments/:commentId", () => {
    let commentId: number;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/fixtures/${fixture.id}/comments`)
        .set("Cookie", [userToken1])
        .send({ content: "Comment to delete" });
      commentId = res.body.id;
    });

    it("should successfully delete the comment if the user is the owner (200)", async () => {
      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}/comments/${commentId}`)
        .set("Cookie", [userToken1]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Comment deleted successfully");

      // Verify not found in get
      const getRes = await request(app).get(`/api/fixtures/${fixture.id}/comments`);
      expect(getRes.body.length).toBe(0);
    });

    it("should successfully delete the comment if the user is an admin (200)", async () => {
      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}/comments/${commentId}`)
        .set("Cookie", [adminToken]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Comment deleted successfully");

      // Verify not found in get
      const getRes = await request(app).get(`/api/fixtures/${fixture.id}/comments`);
      expect(getRes.body.length).toBe(0);
    });

    it("should return 401 Unauthorized if not authenticated", async () => {
      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}/comments/${commentId}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "UnauthorizedError");
    });

    it("should return 403 Forbidden if user is not the owner and not an admin", async () => {
      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}/comments/${commentId}`)
        .set("Cookie", [userToken2]);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "ForbiddenError");
    });

    it("should return 404 Not Found if the comment does not exist", async () => {
      const res = await request(app)
        .delete(`/api/fixtures/${fixture.id}/comments/999999`)
        .set("Cookie", [userToken1]);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "NotFoundError");
    });

    it("should return 404 Not Found if the fixtureId in the route does not match the comment's fixtureId", async () => {
      // Seed a second fixture
      const groupRepo = AppDataSource.getRepository(Group);
      const fixtureRepo = AppDataSource.getRepository(Fixture);

      const fixture2 = new Fixture();
      fixture2.id = 9912;
      fixture2.referee = "Comments Ref 2";
      fixture2.stadium = "Stadium H";
      fixture2.stadiumCity = "City H";
      fixture2.homeTeamId = teamHome.id;
      fixture2.homeTeamName = teamHome.name;
      fixture2.awayTeamId = teamAway.id;
      fixture2.awayTeamName = teamAway.name;
      fixture2.round = "Group Stage - 1";
      fixture2.homeTeam = teamHome;
      fixture2.awayTeam = teamAway;
      await fixtureRepo.save(fixture2);

      try {
        const res = await request(app)
          .delete(`/api/fixtures/${fixture2.id}/comments/${commentId}`)
          .set("Cookie", [userToken1]);

        expect(res.status).toBe(404);
      } finally {
        await fixtureRepo.delete({ id: 9912 });
      }
    });
  });
});
