import { IUser } from '../../models/userSchema';
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      token?: string;
      rootUser?: IUser;
      userID?: string;
      user?: {
        _id: string;
        admin: boolean;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userID: string; // Changed from optional to required
  }
} 