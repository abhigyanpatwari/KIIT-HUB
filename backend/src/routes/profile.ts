// Importing required libraries
import express, { Request, Response } from 'express';
import jwt_Authenticate from '../middlewares/jwt_authenticate';
import { IUser } from '../models/userSchema';
import User from '../models/userSchema';
import session_Authenticate from '../middlewares/session_authenticate';
import { Session } from 'express-session';

// Define authenticated request interface with rootUser property
interface AuthenticatedRequest extends Request {
  rootUser?: IUser;
  token?: string;
  userID?: string;
}

// Extend Request to include user properties
interface ExtendedRequest extends Request {
    rootUser?: any;
    userID?: string;
    token?: string;
    session: Session & {
        userID?: string;
    };
}

// Using Express Router Class
const router = express.Router();

// form page to get profile details after verifying the JWT token using middle Ware
router.get('/', jwt_Authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Profile request received');
    console.log('User data:', req.rootUser);
    
    if (!req.rootUser) {
      console.error('No user data found in request');
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive information
    const userData = { ...req.rootUser.toObject() };
    delete userData.password;
    delete userData.tokens;

    console.log('Sending profile data');
    res.status(200).json(userData);
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users with their listings (alternative to /db endpoint)
router.get('/all-users', async (req: Request, res: Response) => {
  try {
    console.log('GET /profilec/all-users endpoint accessed');
    
    // Fetch all users with minimal data for listings
    const users = await User.find({}).select({ 
      list: 1,  // Include the list of items
      name: 1,  // Include name for seller info
      _id: 1    // Include ID for references
    });
    
    console.log(`Found ${users.length} users with their listings data`);
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// Get profile (using JWT auth)
router.get('/profilec', jwt_Authenticate, async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("JWT auth - user profile requested");
        res.send(req.rootUser);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Get current user (using session auth) - NEW ENDPOINT
router.get('/current-user', session_Authenticate, async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("Session auth - current user requested");
        if (!req.session.userID) {
            return res.status(401).json({ success: false, message: "User not authenticated via session" });
        }

        const user = await User.findById(req.session.userID);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in /current-user route:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Get profile (using session auth)
router.get('/profile', session_Authenticate, async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("Session auth - user profile requested");
        if (!req.session.userID) {
            return res.status(401).send({ error: "User not authenticated via session" });
        }

        const user = await User.findById(req.session.userID);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

export default router;
