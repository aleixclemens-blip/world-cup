import "reflect-metadata";
import app from "./app";
import { config } from "./config";
import { logger } from "./middleware/logger";
import { AppDataSource } from "./config/database";
import { Server } from "http";

let server: Server;

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connection initialized successfully");
    server = app.listen(config.PORT, () => {
      logger.info(
        `Server started on port ${config.PORT} in ${config.NODE_ENV} mode`,
      );
    });
  })
  .catch((err: unknown) => {
    logger.error({ err }, "Failed to initialize database connection");
    process.exit(1);
  });

function gracefulShutdown(signal: string): void {
  logger.info(
    `${signal} signal received: closing HTTP server and database connection`,
  );
  const closeDb = async (): Promise<void> => {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        logger.info("Database connection destroyed");
      }
    } catch (err) {
      logger.error({ err }, "Error destroying database connection");
    } finally {
      process.exit(0);
    }
  };

  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
      void closeDb();
    });
  } else {
    void closeDb();
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
