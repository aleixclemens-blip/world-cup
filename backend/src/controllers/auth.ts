import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { config } from "../config";
import { UnauthorizedError } from "../lib/errors";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = res.locals.parsed.body;
    const user = await this.authService.registerUser(email, username, password);
    res.status(201).json(user);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = res.locals.parsed.body;
    const identifier = email || username;
    const user = await this.authService.loginUser(identifier, password);

    const accessToken = this.authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    const refreshToken = this.authService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    await this.authService.saveRefreshToken(user.id, refreshToken);

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge:
        this.authService.parseExpiryToSeconds(config.ACCESES_TOKEN_EXPIRE) *
        1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge:
        this.authService.parseExpiryToSeconds(config.REFRESH_TOKEN_EXPIRE) *
        1000,
    });

    res.status(200).json(user);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const clearOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
    res.status(200).json({ message: "Successfully logged out" });
  };

  me = (req: Request, res: Response): void => {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    res.status(200).json(req.user);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is missing");
    }

    const user = await this.authService.verifyRefreshToken(refreshToken);

    const newAccessToken = this.authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    const newRefreshToken = this.authService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    await this.authService.revokeRefreshToken(refreshToken);
    await this.authService.saveRefreshToken(user.id, newRefreshToken);

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge:
        this.authService.parseExpiryToSeconds(config.ACCESES_TOKEN_EXPIRE) *
        1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge:
        this.authService.parseExpiryToSeconds(config.REFRESH_TOKEN_EXPIRE) *
        1000,
    });

    res.status(200).json({ message: "Tokens refreshed successfully" });
  };

  adminOnly = (req: Request, res: Response): void => {
    res.status(200).json({ message: "Welcome, admin" });
  };
}
