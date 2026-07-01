import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../lib/errors";

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}
