import 'express-session';

declare module 'express-session' {
  interface Session {
    userID: string;
    isAuthenticated: boolean;
  }
} 