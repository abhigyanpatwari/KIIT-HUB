import express, { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

// Define request with session interface
interface ExtendedRequest extends Request {
  userID?: string;
  session: Session & {
    userID?: string;
  }
}

/**
 * Middleware to authenticate session-based requests
 */
const session_Authenticate = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if session exists and user is authenticated
    if (!req.session || !req.session.userID) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    // Add userID to request for use in routes
    req.userID = req.session.userID;
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
};

export default session_Authenticate; 