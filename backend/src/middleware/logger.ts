import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

export const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
    ],
    remove: true,
  },
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const id = req.headers['x-request-id'] || randomUUID();
    return id;
  },
});

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id'] || randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('x-request-id', id);
  next();
}
