import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  parseExpiryToSeconds,
} from '../services/auth';
import { config } from '../config';
import { UnauthorizedError } from '../lib/errors';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = res.locals.parsed.body;
  const user = await registerUser(email, password);
  res.status(201).json(user);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = res.locals.parsed.body;
  const user = await loginUser(email, password);

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await saveRefreshToken(user.id, refreshToken);

  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseExpiryToSeconds(config.ACCESES_TOKEN_EXPIRE) * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseExpiryToSeconds(config.REFRESH_TOKEN_EXPIRE) * 1000,
  });

  res.status(200).json(user);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  const clearOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  res.clearCookie('accessToken', clearOptions);
  res.clearCookie('refreshToken', clearOptions);
  res.status(200).json({ message: 'Successfully logged out' });
}

export function me(req: Request, res: Response): void {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  res.status(200).json(req.user);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token is missing');
  }

  const user = await verifyRefreshToken(refreshToken);

  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
  const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await revokeRefreshToken(refreshToken);
  await saveRefreshToken(user.id, newRefreshToken);

  res.cookie('accessToken', newAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseExpiryToSeconds(config.ACCESES_TOKEN_EXPIRE) * 1000,
  });

  res.cookie('refreshToken', newRefreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseExpiryToSeconds(config.REFRESH_TOKEN_EXPIRE) * 1000,
  });

  res.status(200).json({ message: 'Tokens refreshed successfully' });
}

