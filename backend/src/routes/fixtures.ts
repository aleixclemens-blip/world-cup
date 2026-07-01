import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Fixture } from "../entities/Fixture";
import { FixturesService } from "../services/fixtures";
import { FixturesController } from "../controllers/fixtures";
import { validate } from "../middleware/validate";
import { GetFixturesSchema } from "../schemas/fixtures";

const router = Router();

const fixtureRepository = AppDataSource.getRepository(Fixture);
const fixturesService = new FixturesService(fixtureRepository);
const fixturesController = new FixturesController(fixturesService);

router.get("/", validate(GetFixturesSchema), fixturesController.getFixtures);

export default router;
