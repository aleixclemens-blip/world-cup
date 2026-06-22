export interface HealthStatus {
  status: 'UP';
  timestamp: string;
  uptime: number;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
