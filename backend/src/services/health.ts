import { AppDataSource } from "../config/database";

export interface HealthStatus {
  status: "UP" | "DOWN";
  timestamp: string;
  uptime: number;
  database: "UP" | "DOWN";
}

export async function getHealthStatus(): Promise<HealthStatus> {
  let dbStatus: "UP" | "DOWN" = "DOWN";
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query("SELECT 1");
      dbStatus = "UP";
    }
  } catch {
    dbStatus = "DOWN";
  }

  const isUp = dbStatus === "UP";

  return {
    status: isUp ? "UP" : "DOWN",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  };
}
