import type { SessionData } from "express-session";

declare global {
  namespace Express {
    interface Request {
      session?: SessionData & {
        referrerId?: string;
        campaign?: string;
        // Add other session properties here
      };
      user?: {
        id: string;
        // Add other user properties here
      };
    }
  }
}

export {};
