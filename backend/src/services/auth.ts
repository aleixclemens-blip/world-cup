import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { config } from '../config';
import { ConflictError, UnauthorizedError } from '../lib/errors';

export interface UserAuthResult {
  id: number;
  email: string;
}

export async function registerUser(email: string, passwordPlain: string): Promise<UserAuthResult> {
  const userRepo = AppDataSource.getRepository(User);
  
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    throw new ConflictError('User with this email already exists');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(passwordPlain, saltRounds);

  const user = new User();
  user.email = email;
  user.password = hashedPassword;
  
  const savedUser = await userRepo.save(user);

  return {
    id: savedUser.id,
    email: savedUser.email,
  };
}

export async function loginUser(email: string, passwordPlain: string): Promise<UserAuthResult> {
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const matches = await bcrypt.compare(passwordPlain, user.password);
  if (!matches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return {
    id: user.id,
    email: user.email,
  };
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([mdhs])$/);
  if (!match) return 24 * 60 * 60;
  const val = parseInt(match[1]!, 10);
  const unit = match[2];
  switch (unit) {
    case 'm': return val * 60;
    case 'h': return val * 60 * 60;
    case 'd': return val * 24 * 60 * 60;
    case 's': return val;
    default: return val * 60;
  }
}

export function generateAccessToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: parseExpiryToSeconds(config.ACCESES_TOKEN_EXPIRE) });
}

export function generateRefreshToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: parseExpiryToSeconds(config.REFRESH_TOKEN_EXPIRE) });
}

export async function saveRefreshToken(userId: number, token: string): Promise<void> {
  const decoded = jwt.decode(token) as { exp?: number };
  if (!decoded || !decoded.exp) {
    throw new Error('Invalid token structure: exp claim is missing');
  }

  const expiresAt = new Date(decoded.exp * 1000);
  const tokenRepo = AppDataSource.getRepository(RefreshToken);
  const hashed = hashToken(token);

  const refreshToken = new RefreshToken();
  refreshToken.token = hashed;
  refreshToken.userId = userId;
  refreshToken.expiresAt = expiresAt;

  await tokenRepo.save(refreshToken);
}

export async function verifyRefreshToken(token: string): Promise<UserAuthResult> {
  let decoded: { userId: number; email: string; exp: number };
  try {
    decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as typeof decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenRepo = AppDataSource.getRepository(RefreshToken);
  const hashed = hashToken(token);
  const tokenRecord = await tokenRepo.findOne({ where: { token: hashed, userId: decoded.userId } });

  if (!tokenRecord) {
    throw new UnauthorizedError('Refresh token has been revoked or is invalid');
  }

  if (new Date() > tokenRecord.expiresAt) {
    await tokenRepo.remove(tokenRecord);
    throw new UnauthorizedError('Refresh token has expired');
  }

  return {
    id: decoded.userId,
    email: decoded.email,
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenRepo = AppDataSource.getRepository(RefreshToken);
  const hashed = hashToken(token);
  await tokenRepo.delete({ token: hashed });
}

