import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Repository } from "typeorm";
import { User } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import { config } from "../config";
import { ConflictError, UnauthorizedError } from "../lib/errors";

export interface UserAuthResult {
  id: number;
  email: string;
}

export class AuthService {
  constructor(
    private userRepository: Repository<User>,
    private tokenRepository: Repository<RefreshToken>,
  ) {}

  async registerUser(
    email: string,
    passwordPlain: string,
  ): Promise<UserAuthResult> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictError("User with this email already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordPlain, saltRounds);

    const user = new User();
    user.email = email;
    user.password = hashedPassword;

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
    };
  }

  async loginUser(
    email: string,
    passwordPlain: string,
  ): Promise<UserAuthResult> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const matches = await bcrypt.compare(passwordPlain, user.password);
    if (!matches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([mdhs])$/);
    if (!match) return 24 * 60 * 60;
    const val = parseInt(match[1]!, 10);
    const unit = match[2];
    switch (unit) {
      case "m":
        return val * 60;
      case "h":
        return val * 60 * 60;
      case "d":
        return val * 24 * 60 * 60;
      case "s":
        return val;
      default:
        return val * 60;
    }
  }

  generateAccessToken(payload: { userId: number; email: string }): string {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: this.parseExpiryToSeconds(config.ACCESES_TOKEN_EXPIRE),
    });
  }

  generateRefreshToken(payload: { userId: number; email: string }): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: this.parseExpiryToSeconds(config.REFRESH_TOKEN_EXPIRE),
    });
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token structure: exp claim is missing");
    }

    const expiresAt = new Date(decoded.exp * 1000);
    const hashed = this.hashToken(token);

    const refreshToken = new RefreshToken();
    refreshToken.token = hashed;
    refreshToken.userId = userId;
    refreshToken.expiresAt = expiresAt;

    await this.tokenRepository.save(refreshToken);
  }

  async verifyRefreshToken(token: string): Promise<UserAuthResult> {
    let decoded: { userId: number; email: string; exp: number };
    try {
      decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as typeof decoded;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const hashed = this.hashToken(token);
    const tokenRecord = await this.tokenRepository.findOne({
      where: { token: hashed, userId: decoded.userId },
    });

    if (!tokenRecord) {
      throw new UnauthorizedError(
        "Refresh token has been revoked or is invalid",
      );
    }

    if (new Date() > tokenRecord.expiresAt) {
      await this.tokenRepository.remove(tokenRecord);
      throw new UnauthorizedError("Refresh token has expired");
    }

    return {
      id: decoded.userId,
      email: decoded.email,
    };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const hashed = this.hashToken(token);
    await this.tokenRepository.delete({ token: hashed });
  }
}
