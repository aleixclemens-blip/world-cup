import { Repository } from "typeorm";
import { Comment } from "../entities/Comment";
import { Fixture } from "../entities/Fixture";
import { NotFoundError } from "../lib/errors";

export class CommentsService {
  constructor(
    private commentRepository: Repository<Comment>,
    private fixtureRepository: Repository<Fixture>
  ) {}

  async checkFixtureExists(fixtureId: number): Promise<void> {
    const exists = await this.fixtureRepository.findOne({ where: { id: fixtureId } });
    if (!exists) {
      throw new NotFoundError(`Fixture with ID ${fixtureId} not found`);
    }
  }

  async getComments(fixtureId: number): Promise<Comment[]> {
    await this.checkFixtureExists(fixtureId);

    return this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.user", "user")
      .select([
        "comment.id",
        "comment.content",
        "comment.createdAt",
        "comment.userId",
        "comment.fixtureId",
        "user.id",
        "user.username",
      ])
      .where("comment.fixtureId = :fixtureId", { fixtureId })
      .orderBy("comment.createdAt", "DESC")
      .getMany();
  }

  async createComment(
    fixtureId: number,
    userId: number,
    content: string
  ): Promise<Comment> {
    await this.checkFixtureExists(fixtureId);

    const comment = this.commentRepository.create({
      fixtureId,
      userId,
      content,
    });
    const saved = await this.commentRepository.save(comment);

    const found = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.user", "user")
      .select([
        "comment.id",
        "comment.content",
        "comment.createdAt",
        "comment.userId",
        "comment.fixtureId",
        "user.id",
        "user.username",
      ])
      .where("comment.id = :id", { id: saved.id })
      .getOne();

    if (!found) {
      throw new NotFoundError("Created comment could not be loaded");
    }
    return found;
  }

  async getCommentById(commentId: number): Promise<Comment | null> {
    return this.commentRepository.findOne({ where: { id: commentId } });
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.commentRepository.delete(commentId);
  }
}
