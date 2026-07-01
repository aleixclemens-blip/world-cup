import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Standing } from "../entities/Standing";
import { StandingsService } from "../services/standings";
import { StandingsController } from "../controllers/standings";

const router = Router();

const standingRepository = AppDataSource.getRepository(Standing);
const standingsService = new StandingsService(standingRepository);
const standingsController = new StandingsController(standingsService);

router.get("/", standingsController.getStandings);

export default router;
