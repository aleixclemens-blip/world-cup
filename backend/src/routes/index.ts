import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import standingsRouter from "./standings";
import teamsRouter from "./teams";
import fixturesRouter from "./fixtures";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/standings", standingsRouter);
router.use("/teams", teamsRouter);
router.use("/fixtures", fixturesRouter);

export default router;
