import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError } from "../lib/errors";

import { UserRole } from "../entities/User";

interface DecodedToken {
  userId: number;
  email: string;
  username: string;
  role: UserRole;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies.accessToken as string | undefined;

  if (!token) {
    throw new UnauthorizedError("Authentication token is missing");
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET, { algorithms: ["HS256"] }) as DecodedToken;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }
}
