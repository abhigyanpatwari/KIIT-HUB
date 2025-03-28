import { IUser } from '../models/userSchema';
import * as express from 'express';
import 'express-session';

// Extend Express Request
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

// Extend Express Session
declare module 'express-session' {
  interface Session {
    userID?: string;
  }
} 