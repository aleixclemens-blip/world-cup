import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { TeamsService } from "../services/teams";
import { TeamsController } from "../controllers/teams";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { AddFavoriteTeamSchema, RemoveFavoriteTeamSchema, GetTeamsSchema } from "../schemas/teams";

const router = Router();

const teamRepository = AppDataSource.getRepository(Team);
const userRepository = AppDataSource.getRepository(User);
const teamsService = new TeamsService(teamRepository, userRepository);
const teamsController = new TeamsController(teamsService);

router.get("/", validate(GetTeamsSchema), teamsController.getTeams);
router.post(
  "/favorites",
  validate(AddFavoriteTeamSchema),
  authenticate,
  teamsController.addFavoriteTeam,
);
router.get("/favorites", authenticate, teamsController.getFavoriteTeams);
router.delete(
  "/favorites",
  validate(RemoveFavoriteTeamSchema),
  authenticate,
  teamsController.removeFavoriteTeam,
);

export default router;
