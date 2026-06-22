import app from './app';
import { config } from './config';
import { logger } from './middleware/logger';
import { Server } from 'http';

const server: Server = app.listen(config.PORT, () => {
  logger.info(`Server started on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

function gracefulShutdown(signal: string): void {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
