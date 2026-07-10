import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";
import { UserRole } from "../entities/User";

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("Forbidden: You do not have the required role");
    }
    next();
  };
}
