import { Request, Response } from "express";
import { CommentsService } from "../services/comments";
import { CreateCommentInput, GetCommentsInput, DeleteCommentInput } from "../schemas/comments";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../lib/errors";

export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  createComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    const parsed = res.locals.parsed as CreateCommentInput;
    const { fixtureId } = parsed.params;
    const { content } = parsed.body;
    const userId = req.user.id;

    const comment = await this.commentsService.createComment(fixtureId, userId, content);
    res.status(201).json(comment);
  };

  getComments = async (req: Request, res: Response): Promise<void> => {
    const parsed = res.locals.parsed as GetCommentsInput;
    const { fixtureId } = parsed.params;

    const comments = await this.commentsService.getComments(fixtureId);
    res.status(200).json(comments);
  };

  deleteComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    const parsed = res.locals.parsed as DeleteCommentInput;
    const { fixtureId, commentId } = parsed.params;

    const comment = await this.commentsService.getCommentById(commentId);
    if (!comment) {
      throw new NotFoundError(`Comment with ID ${commentId} not found`);
    }

    if (comment.fixtureId !== fixtureId) {
      throw new NotFoundError(`Comment with ID ${commentId} not found under fixture ${fixtureId}`);
    }

    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      throw new ForbiddenError("Forbidden: You are not authorized to delete this comment");
    }

    await this.commentsService.deleteComment(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  };
}
