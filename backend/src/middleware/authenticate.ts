import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../lib/errors';

interface DecodedToken {
  userId: number;
  email: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.accessToken as string | undefined;

  if (!token) {
    throw new UnauthorizedError('Authentication token is missing');
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as DecodedToken;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
}
