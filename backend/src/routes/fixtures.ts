import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Fixture } from "../entities/Fixture";
import { Comment } from "../entities/Comment";
import { FixturesService } from "../services/fixtures";
import { FixturesController } from "../controllers/fixtures";
import { CommentsService } from "../services/comments";
import { CommentsController } from "../controllers/comments";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { GetFixturesSchema, GetFixtureByIdSchema } from "../schemas/fixtures";
import { CreateCommentSchema, GetCommentsSchema, DeleteCommentSchema } from "../schemas/comments";

const router = Router();

const fixtureRepository = AppDataSource.getRepository(Fixture);
const commentRepository = AppDataSource.getRepository(Comment);

const fixturesService = new FixturesService(fixtureRepository);
const fixturesController = new FixturesController(fixturesService);

const commentsService = new CommentsService(commentRepository, fixtureRepository);
const commentsController = new CommentsController(commentsService);

router.get("/", validate(GetFixturesSchema), fixturesController.getFixtures);

router.get(
  "/:id",
  validate(GetFixtureByIdSchema),
  fixturesController.getFixtureById,
);


router.post(
  "/:fixtureId/comments",
  validate(CreateCommentSchema),
  authenticate,
  commentsController.createComment,
);

router.get(
  "/:fixtureId/comments",
  validate(GetCommentsSchema),
  commentsController.getComments,
);

router.delete(
  "/:fixtureId/comments/:commentId",
  validate(DeleteCommentSchema),
  authenticate,
  commentsController.deleteComment,
);

export default router;
