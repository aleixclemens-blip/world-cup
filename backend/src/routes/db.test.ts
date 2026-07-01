import { AppDataSource } from "../config/database";
import { Group } from "../entities/Group";
import { Team } from "../entities/Team";

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

describe("Database Entities", () => {
  it("should create and retrieve a Group and a Team correctly", async () => {
    const groupRepo = AppDataSource.getRepository(Group);
    const teamRepo = AppDataSource.getRepository(Team);

    // Clean up test data if present
    await teamRepo.delete({ id: 9999 });
    await groupRepo.delete({ name: "Test Group" });

    // Save group
    const group = new Group();
    group.name = "Test Group";
    const savedGroup = await groupRepo.save(group);

    expect(savedGroup.id).toBeDefined();
    expect(savedGroup.name).toBe("Test Group");

    // Save team
    const team = new Team();
    team.id = 9999;
    team.name = "Test Team";
    team.founded = 2026;
    team.mainStadium = "Test Stadium";
    team.mainStadiumCity = "Test City";
    team.group = savedGroup;

    const savedTeam = await teamRepo.save(team);
    expect(savedTeam.id).toBe(9999);
    expect(savedTeam.name).toBe("Test Team");
    expect(savedTeam.groupId).toBe(savedGroup.id);

    // Fetch team with group relationship
    const foundTeam = await teamRepo.findOne({
      where: { id: 9999 },
      relations: ["group"],
    });

    expect(foundTeam).toBeDefined();
    expect(foundTeam?.group?.name).toBe("Test Group");

    // Clean up
    await teamRepo.delete({ id: 9999 });
    await groupRepo.delete({ id: savedGroup.id });
  });
});
