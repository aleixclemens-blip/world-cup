import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/database";

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

describe("GET /health", () => {
  it("should return 200 with status UP", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "UP");
    expect(res.body).toHaveProperty("database", "UP");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
  });

  it("should return 404 for non-existent route", async () => {
    const res = await request(app).get("/non-existent-route");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "NotFoundError");
  });
});
