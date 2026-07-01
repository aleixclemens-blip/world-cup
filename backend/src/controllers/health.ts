import { Request, Response } from "express";
import { getHealthStatus } from "../services/health";

export async function checkHealth(req: Request, res: Response): Promise<void> {
  const status = await getHealthStatus();
  const httpStatus = status.status === "UP" ? 200 : 500;
  res.status(httpStatus).json(status);
}
