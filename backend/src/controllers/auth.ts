import { Request, Response } from 'express';
import { registerUser, loginUser, generateToken } from '../services/auth';
import { config } from '../config';
import { UnauthorizedError } from '../lib/errors';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = res.locals.parsed.body;
  const user = await registerUser(email, password);
  res.status(201).json(user);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = res.locals.parsed.body;
  const user = await loginUser(email, password);
  const token = generateToken({ userId: user.id, email: user.email });

  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(200).json(user);
}

export function logout(req: Request, res: Response): void {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Successfully logged out' });
}

export function me(req: Request, res: Response): void {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  res.status(200).json(req.user);
}
