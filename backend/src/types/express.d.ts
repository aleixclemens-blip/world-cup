declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        role: "user" | "admin";
      };
    }
  }
}

export {};
