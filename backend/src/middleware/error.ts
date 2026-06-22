import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/errors';
import { logger } from './logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const reqId = req.headers['x-request-id'];
  
  if (err instanceof HttpError) {
    logger.warn({ err, reqId }, `HTTP Error ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      error: err.constructor.name,
      message: err.message,
    });
    return;
  }

  logger.error({ err, reqId }, 'Unhandled Internal Server Error');
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
}
