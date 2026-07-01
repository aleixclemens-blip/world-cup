import { Repository, Like } from "typeorm";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { NotFoundError } from "../lib/errors";

export class TeamsService {
  constructor(
    private teamRepository: Repository<Team>,
    private userRepository: Repository<User>,
  ) {}

  async getTeamsWithGroups(name?: string): Promise<Team[]> {
    if (name) {
      return this.teamRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
        relations: ["group"],
      });
    }
    return this.teamRepository.find({
      relations: ["group"],
    });
  }

  async addFavoriteTeam(userId: number, teamId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteTeams"],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    const isAlreadyFavorite = user.favoriteTeams.some((t) => t.id === teamId);
    if (!isAlreadyFavorite) {
      user.favoriteTeams.push(team);
      await this.userRepository.save(user);
    }
  }

  async getFavoriteTeams(userId: number): Promise<Team[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteTeams", "favoriteTeams.group"],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.favoriteTeams;
  }

  async removeFavoriteTeam(userId: number, teamId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favoriteTeams"],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    user.favoriteTeams = user.favoriteTeams.filter((t) => t.id !== teamId);
    await this.userRepository.save(user);
  }
}
