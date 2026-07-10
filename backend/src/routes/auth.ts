import { Router } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import { AuthService } from "../services/auth";
import { AuthController } from "../controllers/auth";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/authorize";
import { RegisterSchema, LoginSchema } from "../schemas/auth";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const tokenRepository = AppDataSource.getRepository(RefreshToken);
const authService = new AuthService(userRepository, tokenRepository);
const authController = new AuthController(authService);

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authenticate, authController.me);
router.get(
  "/admin-only",
  authenticate,
  requireRole(["admin"]),
  authController.adminOnly,
);

export default router;
