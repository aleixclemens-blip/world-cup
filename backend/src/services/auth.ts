import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
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

export function generateToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, config.SECRET_KEY, { expiresIn: '24h' });
}
